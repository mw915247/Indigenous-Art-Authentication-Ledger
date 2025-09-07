(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INVALID-HASH (err u101))
(define-constant ERR-INVALID-TITLE (err u102))
(define-constant ERR-INVALID-DESCRIPTION (err u103))
(define-constant ERR-INVALID-CULTURAL-METADATA (err u104))
(define-constant ERR-ART-ALREADY-EXISTS (err u105))
(define-constant ERR-INVALID-ART-ID (err u106))
(define-constant ERR-ART-NOT-FOUND (err u107))
(define-constant ERR-INVALID-TIMESTAMP (err u108))
(define-constant ERR-AUTHORITY-NOT-VERIFIED (err u109))
(define-constant ERR-INVALID-ORIGIN-PROOF (err u110))
(define-constant ERR-INVALID-BOUNDARIES (err u111))
(define-constant ERR-ART-UPDATE-NOT-ALLOWED (err u112))
(define-constant ERR-INVALID-UPDATE-HASH (err u113))
(define-constant ERR-MAX-ARTS-EXCEEDED (err u114))
(define-constant ERR-INVALID-ART-TYPE (err u115))
(define-constant ERR-INVALID-MEDIUM (err u116))
(define-constant ERR-INVALID-DIMENSIONS (err u117))
(define-constant ERR-INVALID-CREATION-YEAR (err u118))
(define-constant ERR-INVALID-TRIBAL-AFFILIATION (err u119))
(define-constant ERR-INVALID-CERTIFICATION-STATUS (err u120))

(define-data-var next-art-id uint u0)
(define-data-var max-arts uint u10000)
(define-data-var registration-fee uint u500)
(define-data-var authority-contract (optional principal) none)

(define-map artworks
  uint
  {
    hash: (buff 32),
    title: (string-ascii 100),
    description: (string-utf8 500),
    cultural-metadata: (string-utf8 1000),
    timestamp: uint,
    artist: principal,
    art-type: (string-ascii 50),
    medium: (string-ascii 50),
    dimensions: { width: uint, height: uint, depth: uint },
    creation-year: uint,
    tribal-affiliation: (string-ascii 100),
    origin-proof: (buff 64),
    certification-status: bool
  }
)

(define-map artworks-by-hash
  (buff 32)
  uint)

(define-map art-updates
  uint
  {
    update-hash: (buff 32),
    update-title: (string-ascii 100),
    update-description: (string-utf8 500),
    update-timestamp: uint,
    updater: principal
  }
)

(define-read-only (get-art (id uint))
  (map-get? artworks id)
)

(define-read-only (get-art-updates (id uint))
  (map-get? art-updates id)
)

(define-read-only (is-art-registered (h (buff 32)))
  (is-some (map-get? artworks-by-hash h))
)

(define-private (validate-hash (h (buff 32)))
  (if (is-eq (len h) u32)
      (ok true)
      ERR-INVALID-HASH)
)

(define-private (validate-title (t (string-ascii 100)))
  (if (> (len t) u0)
      (ok true)
      ERR-INVALID-TITLE)
)

(define-private (validate-description (desc (string-utf8 500)))
  (if (> (len desc) u0)
      (ok true)
      ERR-INVALID-DESCRIPTION)
)

(define-private (validate-cultural-metadata (meta (string-utf8 1000)))
  (if (> (len meta) u0)
      (ok true)
      ERR-INVALID-CULTURAL-METADATA)
)

(define-private (validate-art-type (at (string-ascii 50)))
  (if (or (is-eq at "painting") (is-eq at "sculpture") (is-eq at "textile") (is-eq at "ceramic"))
      (ok true)
      ERR-INVALID-ART-TYPE)
)

(define-private (validate-medium (m (string-ascii 50)))
  (if (or (is-eq m "oil") (is-eq m "wood") (is-eq m "fabric") (is-eq m "clay"))
      (ok true)
      ERR-INVALID-MEDIUM)
)

(define-private (validate-dimensions (dims { width: uint, height: uint, depth: uint }))
  (if (and (> (get width dims) u0) (> (get height dims) u0))
      (ok true)
      ERR-INVALID-DIMENSIONS)
)

(define-private (validate-creation-year (year uint))
  (if (and (>= year u1800) (<= year u2100))
      (ok true)
      ERR-INVALID-CREATION-YEAR)
)

(define-private (validate-tribal-affiliation (ta (string-ascii 100)))
  (if (> (len ta) u0)
      (ok true)
      ERR-INVALID-TRIBAL-AFFILIATION)
)

(define-private (validate-origin-proof (op (buff 64)))
  (if (is-eq (len op) u64)
      (ok true)
      ERR-INVALID-ORIGIN-PROOF)
)

(define-public (set-authority-contract (contract-principal principal))
  (begin
    (asserts! (is-none (var-get authority-contract)) ERR-AUTHORITY-NOT-VERIFIED)
    (var-set authority-contract (some contract-principal))
    (ok true))
)

(define-public (set-max-arts (new-max uint))
  (begin
    (asserts! (is-some (var-get authority-contract)) ERR-AUTHORITY-NOT-VERIFIED)
    (var-set max-arts new-max)
    (ok true))
)

(define-public (set-registration-fee (new-fee uint))
  (begin
    (asserts! (is-some (var-get authority-contract)) ERR-AUTHORITY-NOT-VERIFIED)
    (var-set registration-fee new-fee)
    (ok true))
)

(define-public (register-art
  (art-hash (buff 32))
  (title (string-ascii 100))
  (description (string-utf8 500))
  (cultural-metadata (string-utf8 1000))
  (art-type (string-ascii 50))
  (medium (string-ascii 50))
  (dimensions { width: uint, height: uint, depth: uint })
  (creation-year uint)
  (tribal-affiliation (string-ascii 100))
  (origin-proof (buff 64))
  (certification-status bool))
  (let (
        (next-id (var-get next-art-id))
        (current-max (var-get max-arts))
        (authority-check (ok true))
      )
    (asserts! (< next-id current-max) ERR-MAX-ARTS-EXCEEDED)
    (try! (validate-hash art-hash))
    (try! (validate-title title))
    (try! (validate-description description))
    (try! (validate-cultural-metadata cultural-metadata))
    (try! (validate-art-type art-type))
    (try! (validate-medium medium))
    (try! (validate-dimensions dimensions))
    (try! (validate-creation-year creation-year))
    (try! (validate-tribal-affiliation tribal-affiliation))
    (try! (validate-origin-proof origin-proof))
    (asserts! (is-ok authority-check) ERR-NOT-AUTHORIZED)
    (asserts! (is-none (map-get? artworks-by-hash art-hash)) ERR-ART-ALREADY-EXISTS)
    (map-set artworks next-id
      {
        hash: art-hash,
        title: title,
        description: description,
        cultural-metadata: cultural-metadata,
        timestamp: block-height,
        artist: tx-sender,
        art-type: art-type,
        medium: medium,
        dimensions: dimensions,
        creation-year: creation-year,
        tribal-affiliation: tribal-affiliation,
        origin-proof: origin-proof,
        certification-status: certification-status
      })
    (map-set artworks-by-hash art-hash next-id)
    (var-set next-art-id (+ next-id u1))
    (print { event: "art-registered", id: next-id })
    (ok next-id))
)

(define-public (update-art
  (art-id uint)
  (update-hash (buff 32))
  (update-title (string-ascii 100))
  (update-description (string-utf8 500)))
  (let (
        (art (map-get? artworks art-id))
        (authority-check (ok true))
      )
    (match art
      a
        (begin
          (asserts! (is-eq (get artist a) tx-sender) ERR-NOT-AUTHORIZED)
          (try! (validate-hash update-hash))
          (try! (validate-title update-title))
          (try! (validate-description update-description))
          (asserts! (is-ok authority-check) ERR-NOT-AUTHORIZED)
          (let ((existing (map-get? artworks-by-hash update-hash)))
            (asserts!
              (or (is-none existing)
                  (is-eq (default-to uffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff existing) art-id))
              ERR-ART-ALREADY-EXISTS))
          (let ((old-hash (get hash a)))
            (map-delete artworks-by-hash old-hash)
            (map-set artworks-by-hash update-hash art-id))
          (map-set artworks art-id
            {
              hash: update-hash,
              title: update-title,
              description: update-description,
              cultural-metadata: (get cultural-metadata a),
              timestamp: block-height,
              artist: tx-sender,
              art-type: (get art-type a),
              medium: (get medium a),
              dimensions: (get dimensions a),
              creation-year: (get creation-year a),
              tribal-affiliation: (get tribal-affiliation a),
              origin-proof: (get origin-proof a),
              certification-status: (get certification-status a)
            })
          (map-set art-updates art-id
            {
              update-hash: update-hash,
              update-title: update-title,
              update-description: update-description,
              update-timestamp: block-height,
              updater: tx-sender
            })
          (print { event: "art-updated", id: art-id })
          (ok true))
      ERR-ART-NOT-FOUND))
)

(define-public (get-art-count)
  (ok (var-get next-art-id))
)

(define-public (check-art-existence (hash (buff 32)))
  (ok (is-art-registered hash))
)
import { describe, it, expect, beforeEach } from "vitest";

const ERR_NOT_AUTHORIZED = 100;
const ERR_INVALID_HASH = 101;
const ERR_INVALID_TITLE = 102;
const ERR_INVALID_DESCRIPTION = 103;
const ERR_INVALID_CULTURAL_METADATA = 104;
const ERR_ART_ALREADY_EXISTS = 105;
const ERR_ART_NOT_FOUND = 107;
const ERR_INVALID_ART_TYPE = 115;
const ERR_INVALID_MEDIUM = 116;
const ERR_INVALID_DIMENSIONS = 117;
const ERR_INVALID_CREATION_YEAR = 118;
const ERR_INVALID_TRIBAL_AFFILIATION = 119;
const ERR_INVALID_ORIGIN_PROOF = 110;
const ERR_MAX_ARTS_EXCEEDED = 114;
const ERR_INVALID_UPDATE_HASH = 113;

interface Dimensions {
  width: number;
  height: number;
  depth: number;
}

interface Art {
  hash: string;
  title: string;
  description: string;
  culturalMetadata: string;
  timestamp: number;
  artist: string;
  artType: string;
  medium: string;
  dimensions: Dimensions;
  creationYear: number;
  tribalAffiliation: string;
  originProof: string;
  certificationStatus: boolean;
}

interface ArtUpdate {
  updateHash: string;
  updateTitle: string;
  updateDescription: string;
  updateTimestamp: number;
  updater: string;
}

class ArtRegistryMock {
  state!: {
    nextArtId: number;
    maxArts: number;
    artworks: Map<number, Art>;
    artUpdates: Map<number, ArtUpdate>;
  };
  blockHeight = 0;
  caller = "ST1TEST";
  authorities = new Set<string>(["ST1TEST"]);

  constructor() {
    this.reset();
  }

  reset() {
    this.state = {
      nextArtId: 0,
      maxArts: 10000,
      artworks: new Map(),
      artUpdates: new Map(),
    };
    this.blockHeight = 0;
    this.caller = "ST1TEST";
    this.authorities = new Set(["ST1TEST"]);
  }

  isVerifiedAuthority(principal: string): { ok: boolean; value: boolean } {
    return { ok: true, value: this.authorities.has(principal) };
  }

  registerArt(
    artHash: string,
    title: string,
    description: string,
    culturalMetadata: string,
    artType: string,
    medium: string,
    dimensions: Dimensions,
    creationYear: number,
    tribalAffiliation: string,
    originProof: string,
    certificationStatus: boolean
  ): { ok: boolean; value: number | typeof ERR_MAX_ARTS_EXCEEDED | typeof ERR_INVALID_HASH | typeof ERR_INVALID_TITLE | typeof ERR_INVALID_DESCRIPTION | typeof ERR_INVALID_CULTURAL_METADATA | typeof ERR_INVALID_ART_TYPE | typeof ERR_INVALID_MEDIUM | typeof ERR_INVALID_DIMENSIONS | typeof ERR_INVALID_CREATION_YEAR | typeof ERR_INVALID_TRIBAL_AFFILIATION | typeof ERR_INVALID_ORIGIN_PROOF | typeof ERR_NOT_AUTHORIZED | typeof ERR_ART_ALREADY_EXISTS } {
    const nextId = this.state.nextArtId;
    if (nextId >= this.state.maxArts) return { ok: false, value: ERR_MAX_ARTS_EXCEEDED };
    if (artHash.length !== 64 || !/^[0-9a-fA-F]+$/.test(artHash)) return { ok: false, value: ERR_INVALID_HASH };
    if (!title || title.length > 100) return { ok: false, value: ERR_INVALID_TITLE };
    if (!description || description.length > 500) return { ok: false, value: ERR_INVALID_DESCRIPTION };
    if (!culturalMetadata || culturalMetadata.length > 1000) return { ok: false, value: ERR_INVALID_CULTURAL_METADATA };
    if (!["painting", "sculpture", "textile", "ceramic"].includes(artType)) return { ok: false, value: ERR_INVALID_ART_TYPE };
    if (!["oil", "wood", "fabric", "clay"].includes(medium)) return { ok: false, value: ERR_INVALID_MEDIUM };
    if (dimensions.width <= 0 || dimensions.height <= 0) return { ok: false, value: ERR_INVALID_DIMENSIONS };
    if (creationYear < 1800 || creationYear > 2100) return { ok: false, value: ERR_INVALID_CREATION_YEAR };
    if (!tribalAffiliation || tribalAffiliation.length > 100) return { ok: false, value: ERR_INVALID_TRIBAL_AFFILIATION };
    if (originProof.length !== 128 || !/^[0-9a-fA-F]+$/.test(originProof)) return { ok: false, value: ERR_INVALID_ORIGIN_PROOF };

    if (!this.isVerifiedAuthority(this.caller).value) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (Array.from(this.state.artworks.values()).some(a => a.hash === artHash))
      return { ok: false, value: ERR_ART_ALREADY_EXISTS };

    const newArt: Art = {
      hash: artHash,
      title,
      description,
      culturalMetadata,
      timestamp: this.blockHeight,
      artist: this.caller,
      artType,
      medium,
      dimensions,
      creationYear,
      tribalAffiliation,
      originProof,
      certificationStatus,
    };
    this.state.artworks.set(nextId, newArt);
    this.state.nextArtId++;
    return { ok: true, value: nextId };
  }

  getArt(id: number): { ok: boolean; value: Art | null } {
    const art = this.state.artworks.get(id);
    return art ? { ok: true, value: art } : { ok: false, value: null };
  }

  updateArt(id: number, updateHash: string, updateTitle: string, updateDescription: string): { ok: boolean; value: boolean | typeof ERR_ART_NOT_FOUND | typeof ERR_NOT_AUTHORIZED | typeof ERR_INVALID_UPDATE_HASH | typeof ERR_INVALID_TITLE | typeof ERR_INVALID_DESCRIPTION | typeof ERR_ART_ALREADY_EXISTS } {
    const art = this.state.artworks.get(id);
    if (!art) return { ok: false, value: ERR_ART_NOT_FOUND };
    if (art.artist !== this.caller) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (updateHash.length !== 64 || !/^[0-9a-fA-F]+$/.test(updateHash)) return { ok: false, value: ERR_INVALID_UPDATE_HASH };
    if (!updateTitle || updateTitle.length > 100) return { ok: false, value: ERR_INVALID_TITLE };
    if (!updateDescription || updateDescription.length > 500) return { ok: false, value: ERR_INVALID_DESCRIPTION };

    if (Array.from(this.state.artworks.values()).some(a => a.hash === updateHash && a !== art))
      return { ok: false, value: ERR_ART_ALREADY_EXISTS };

    const updated: Art = { ...art, hash: updateHash, title: updateTitle, description: updateDescription, timestamp: this.blockHeight };
    this.state.artworks.set(id, updated);
    this.state.artUpdates.set(id, {
      updateHash,
      updateTitle,
      updateDescription,
      updateTimestamp: this.blockHeight,
      updater: this.caller,
    });
    return { ok: true, value: true };
  }
}

describe("ArtRegistry", () => {
  let contract: ArtRegistryMock;
  beforeEach(() => (contract = new ArtRegistryMock()));

  it("registers a valid art", () => {
    const result = contract.registerArt(
      "a".repeat(64),
      "Sacred Painting",
      "Ancient artwork",
      "Cultural significance",
      "painting",
      "oil",
      { width: 100, height: 150, depth: 5 },
      1950,
      "Navajo",
      "b".repeat(128),
      true
    );
    expect(result.ok).toBe(true);
    expect(contract.getArt(0).value?.title).toBe("Sacred Painting");
  });

  it("rejects invalid hash", () => {
    expect(
      contract.registerArt(
        "bad",
        "title",
        "desc",
        "meta",
        "painting",
        "oil",
        { width: 100, height: 150, depth: 5 },
        1950,
        "Navajo",
        "b".repeat(128),
        true
      )
    ).toEqual({ ok: false, value: ERR_INVALID_HASH });
  });

  it("rejects invalid art type", () => {
    expect(
      contract.registerArt(
        "a".repeat(64),
        "title",
        "desc",
        "meta",
        "invalid",
        "oil",
        { width: 100, height: 150, depth: 5 },
        1950,
        "Navajo",
        "b".repeat(128),
        true
      )
    ).toEqual({ ok: false, value: ERR_INVALID_ART_TYPE });
  });

  it("rejects duplicate art", () => {
    contract.registerArt(
      "a".repeat(64),
      "title",
      "desc",
      "meta",
      "painting",
      "oil",
      { width: 100, height: 150, depth: 5 },
      1950,
      "Navajo",
      "b".repeat(128),
      true
    );
    expect(
      contract.registerArt(
        "a".repeat(64),
        "title2",
        "desc2",
        "meta2",
        "painting",
        "oil",
        { width: 100, height: 150, depth: 5 },
        1950,
        "Navajo",
        "b".repeat(128),
        true
      )
    ).toEqual({ ok: false, value: ERR_ART_ALREADY_EXISTS });
  });

  it("updates a valid art", () => {
    contract.registerArt(
      "a".repeat(64),
      "old",
      "old desc",
      "meta",
      "painting",
      "oil",
      { width: 100, height: 150, depth: 5 },
      1950,
      "Navajo",
      "b".repeat(128),
      true
    );
    const res = contract.updateArt(0, "c".repeat(64), "new", "new desc");
    expect(res.ok).toBe(true);
    expect(contract.getArt(0).value?.title).toBe("new");
  });

  it("rejects update for non-existent art", () => {
    expect(contract.updateArt(99, "c".repeat(64), "x", "y")).toEqual({ ok: false, value: ERR_ART_NOT_FOUND });
  });
});
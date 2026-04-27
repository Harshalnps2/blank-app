import { describe, it, expect } from "vitest";
import {
  canAccessBaby,
  canMutateCareEvent,
  canReadCareEvents,
  canRecordCareEvent,
  isBabyOwner,
  type CaregiverMembership,
} from "@/lib/permissions";

const BABY_A = "00000000-0000-0000-0000-00000000aaaa";
const BABY_B = "00000000-0000-0000-0000-00000000bbbb";
const ALICE = "00000000-0000-0000-0000-0000000a0000";
const BOB = "00000000-0000-0000-0000-0000000b0000";
const CAROL = "00000000-0000-0000-0000-0000000c0000";

const memberships: CaregiverMembership[] = [
  { babyId: BABY_A, userId: ALICE, role: "owner", acceptedAt: "2026-01-01T00:00:00Z" },
  { babyId: BABY_A, userId: BOB, role: "caregiver", acceptedAt: "2026-01-02T00:00:00Z" },
  // Carol was invited but has not accepted yet
  { babyId: BABY_A, userId: CAROL, role: "caregiver", acceptedAt: null },
  // Bob is also caregiver to a *different* baby
  { babyId: BABY_B, userId: BOB, role: "owner", acceptedAt: "2026-01-03T00:00:00Z" },
];

describe("canAccessBaby", () => {
  it("allows the owner", () => {
    expect(canAccessBaby(memberships, BABY_A, ALICE)).toBe(true);
  });

  it("allows an accepted caregiver", () => {
    expect(canAccessBaby(memberships, BABY_A, BOB)).toBe(true);
  });

  it("denies a caregiver who has not accepted yet", () => {
    expect(canAccessBaby(memberships, BABY_A, CAROL)).toBe(false);
  });

  it("denies a user with no membership on this baby", () => {
    expect(canAccessBaby(memberships, BABY_B, ALICE)).toBe(false);
  });

  it("denies an unknown user", () => {
    expect(canAccessBaby(memberships, BABY_A, "00000000-0000-0000-0000-deadbeef0000")).toBe(false);
  });
});

describe("isBabyOwner", () => {
  it("identifies the owner", () => {
    expect(isBabyOwner(memberships, BABY_A, ALICE)).toBe(true);
  });

  it("rejects a non-owner caregiver", () => {
    expect(isBabyOwner(memberships, BABY_A, BOB)).toBe(false);
  });

  it("rejects an unaccepted owner-equivalent (defensive)", () => {
    const pending: CaregiverMembership[] = [
      { babyId: BABY_A, userId: ALICE, role: "owner", acceptedAt: null },
    ];
    expect(isBabyOwner(pending, BABY_A, ALICE)).toBe(false);
  });
});

describe("care_events permissions", () => {
  it("any accepted caregiver can read", () => {
    expect(canReadCareEvents(memberships, BABY_A, BOB)).toBe(true);
    expect(canReadCareEvents(memberships, BABY_A, CAROL)).toBe(false);
  });

  it("any accepted caregiver can record a new event", () => {
    expect(canRecordCareEvent(memberships, BABY_A, BOB)).toBe(true);
    expect(canRecordCareEvent(memberships, BABY_A, CAROL)).toBe(false);
  });

  it("only the recording caregiver can mutate their own event", () => {
    // Bob recorded the event; Bob can edit it.
    expect(canMutateCareEvent(memberships, BABY_A, BOB, BOB)).toBe(true);
    // Alice (owner) cannot edit Bob's event.
    expect(canMutateCareEvent(memberships, BABY_A, BOB, ALICE)).toBe(false);
    // Carol (unaccepted) cannot edit anyone's event.
    expect(canMutateCareEvent(memberships, BABY_A, CAROL, CAROL)).toBe(false);
  });

  it("a user with no membership on the baby cannot read, record, or mutate", () => {
    expect(canReadCareEvents(memberships, BABY_B, ALICE)).toBe(false);
    expect(canRecordCareEvent(memberships, BABY_B, ALICE)).toBe(false);
    expect(canMutateCareEvent(memberships, BABY_B, ALICE, ALICE)).toBe(false);
  });
});

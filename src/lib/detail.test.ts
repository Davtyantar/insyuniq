import { describe, expect, it } from "vitest";
import { PROPERTY_FIXTURE } from "@/test/fixtures";
import { getSeller } from "@/mock/sellers";
import { SERVICE_LISTINGS } from "@/mock/services";
import { WORK_LISTINGS } from "@/mock/work";
import { formatPhone, legacyDetail, propertyDetail } from "./detail";

describe("propertyDetail", () => {
  it("maps the contract listing, seller included", () => {
    const detail = propertyDetail(PROPERTY_FIXTURE);
    expect(detail.door).toBe("rentals");
    expect(detail.reference).toBe("947E6113");
    expect(detail.heroImage).toBe(false);
    expect(detail.location).toBe("Կապան, Կենտրոն");
    expect(detail.seller).toEqual({
      name: "Արթուր Մկրտչյան",
      avatarUrl: undefined,
      typeLabel: "Ֆիզիկական անձ",
      phone: "+374 91 45 22 18",
    });
  });

  it("tolerates a listing without its seller", () => {
    expect(propertyDetail({ ...PROPERTY_FIXTURE, seller: undefined }).seller).toBeNull();
  });
});

describe("legacyDetail", () => {
  it("keeps the work layout: hero photo, workplace heading", () => {
    const job = WORK_LISTINGS[0];
    const detail = legacyDetail(job, getSeller(job.sellerId));
    expect(detail.heroImage).toBe(true);
    expect(detail.isWorkplace).toBe(true);
    expect(detail.reference).toBe(job.id.toUpperCase());
  });

  it("keeps the price on service detail pages, which the service card hides", () => {
    const service = SERVICE_LISTINGS[0];
    expect(legacyDetail(service, getSeller(service.sellerId)).price?.amount).toBe(
      service.prices?.USD ?? service.price,
    );
  });
});

describe("formatPhone", () => {
  it("groups Armenian numbers and leaves others alone", () => {
    expect(formatPhone("+37491452218")).toBe("+374 91 45 22 18");
    expect(formatPhone("+1 555 0100")).toBe("+1 555 0100");
  });
});

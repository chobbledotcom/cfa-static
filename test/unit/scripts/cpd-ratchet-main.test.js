import { describe, expect, test, vi } from "vitest";

const runJscpd = vi.fn();
const loadCpdDuplicates = vi.fn();
vi.mock("#scripts/cpd.js", () => ({
  runJscpd: (...args) => runJscpd(...args),
  loadCpdDuplicates: (...args) => loadCpdDuplicates(...args),
}));

const { main } = await import("#scripts/cpd-ratchet.js");
const { captureCliFailure, noop } = await import("#test/test-utils.js");

describe("cpd-ratchet main", () => {
  test("fails when the code passes at a stricter threshold", async () => {
    runJscpd.mockReturnValueOnce(0);

    const { errors, exitError } = await captureCliFailure(main);

    expect(exitError).toBe("exit:1");
    expect(errors.join("\n")).toContain("Update --min-tokens to");
  });

  test("passes when duplication appears one notch lower", () => {
    runJscpd.mockReturnValueOnce(1);
    loadCpdDuplicates.mockReturnValueOnce([{}, {}]);
    const logSpy = vi.spyOn(console, "log").mockImplementation(noop);

    main();

    expect(runJscpd).toHaveBeenCalledWith(
      expect.arrayContaining(["--min-tokens", "--silent", "--output"]),
      expect.stringContaining("jscpd-report.json"),
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("CPD ratchet passed"),
    );
    logSpy.mockRestore();
  });
});

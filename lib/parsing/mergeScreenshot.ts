import type { Reel, ScreenshotParse } from "@/lib/schemas";

// 스크린샷 파싱 결과(3초 훅·잔존곡선·유입소스)를 릴스에 병합.
// 파싱에 없는 필드는 기존 값을 보존하고, 집계 지표는 건드리지 않는다. 순수.
export function mergeScreenshotParse(reel: Reel, parse: ScreenshotParse): Reel {
  return {
    ...reel,
    hookRetention3s: parse.hookRetention3s ?? reel.hookRetention3s,
    retentionCurve: parse.retentionCurve ?? reel.retentionCurve,
    reachSources: parse.reachSources ?? reel.reachSources,
  };
}

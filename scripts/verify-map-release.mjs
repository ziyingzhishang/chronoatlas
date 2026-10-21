import manifest from '../public/data/map-release-compliance.json' with {type:'json'};
import { evaluateMapRelease } from '../src/compliance/map-release.ts';

const issues = evaluateMapRelease(manifest);
if (issues.length) {
  console.error(`Public map release blocked:\n- ${issues.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(`Public map release approved: ${manifest.reviewNumber}`);
}

import { questions, SURVEY_VERSION } from '../src/lib/data/questions';
import { validateCoverage } from '../src/lib/engine/coverage';
const report = validateCoverage(questions);
console.log(
  `\n${SURVEY_VERSION}: ${report.questions} questions, ${report.mappings} weighted mappings\n`
);
console.table(
  report.rows.map((r) => ({
    ...r,
    positive: r.positive.toFixed(2),
    negative: r.negative.toFixed(2),
    total: r.total.toFixed(2)
  }))
);
for (const error of report.errors) console.error(`ERROR: ${error}`);
for (const warning of report.warnings) console.warn(`WARNING: ${warning}`);
console.log(`\n${report.errors.length} errors; ${report.warnings.length} coverage warnings.`);
process.exitCode = report.errors.length ? 1 : 0;

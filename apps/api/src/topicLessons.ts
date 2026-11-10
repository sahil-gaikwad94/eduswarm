/**
 * Authored topic lessons — the primary local content source.
 *
 * Every topic in the curriculum gets its own lesson entry. These are not
 * runtime-generated, not module-level templates, and not shared between
 * topics. A lesson opens with the subject itself (definition, theory, worked
 * examples), and only puts revision/meta material at the very end.
 */
export type TopicLesson = {
  /** What the topic is, in plain language. Actual subject content from word one. */
  intro: string;
  /** Foundations: definitions, notation, rules, scope, and how the topic works. */
  foundations: string;
  /** Core concepts, each a real teachable section. */
  concepts: Array<{ title: string; body: string }>;
  /** Worked examples with complete solutions. */
  worked: Array<{ title: string; body: string }>;
  /** Exam-style practice with full solutions, including why wrong answers fail. */
  exam: Array<{ question: string; answer: string }>;
  /** Dense revision lines, shown as a separate cheat-sheet card. */
  cheat: string[];
  /** Short closing summary of the actual subject (not study advice). */
  recap: string;
  /** Optional code walkthrough for technical topics. */
  code?: { title: string; language: string; code: string; explanation: string };
  /** Optional visual map. */
  diagram?: { title: string; caption: string; mermaid: string };
};

import { engineeringMathematics } from './lessons/engineering-mathematics.js';
import { digitalLogic } from './lessons/digital-logic.js';
import { computerOrganization } from './lessons/computer-organization.js';
import { programmingAndDataStructures } from './lessons/programming-and-data-structures.js';
import { algorithms } from './lessons/algorithms.js';
import { theoryOfComputation } from './lessons/theory-of-computation.js';
import { operatingSystems } from './lessons/operating-systems.js';
import { compilerDesign } from './lessons/compiler-design.js';
import { databaseManagementSystems } from './lessons/database-management-systems.js';
import { computerNetworks } from './lessons/computer-networks.js';
import { generalAptitudeAndGateStrategy } from './lessons/general-aptitude-and-gate-strategy.js';
import { pyqMarathonsAndTestStrategy } from './lessons/pyq-marathons-and-test-strategy.js';
import { webFoundations } from './lessons/web-foundations.js';
import { engineeringFoundations } from './lessons/engineering-foundations.js';
import { javascriptAndTypeScript } from './lessons/javascript-and-typescript.js';
import { designForEngineers } from './lessons/design-for-engineers.js';
import { reactEcosystem } from './lessons/react-ecosystem.js';
import { backendWithNodeJs } from './lessons/backend-with-node-js.js';
import { dataAndPersistence } from './lessons/data-and-persistence.js';
import { productionEngineering } from './lessons/production-engineering.js';
import { systemDesign } from './lessons/system-design.js';
import { advancedFrontend } from './lessons/advanced-frontend.js';
import { testingAndDelivery } from './lessons/testing-and-delivery.js';
import { pythonAndDataFoundations } from './lessons/python-and-data-foundations.js';
import { dataEngineeringEssentials } from './lessons/data-engineering-essentials.js';
import { mathAndStatisticsForMl } from './lessons/math-and-statistics-for-ml.js';
import { classicalMachineLearning } from './lessons/classical-machine-learning.js';
import { deepLearning } from './lessons/deep-learning.js';
import { nlpAndLanguageModels } from './lessons/nlp-and-language-models.js';
import { generativeAiApplications } from './lessons/generative-ai-applications.js';
import { mlopsAndProductionAi } from './lessons/mlops-and-production-ai.js';
import { computerVisionInDepth } from './lessons/computer-vision-in-depth.js';
import { reinforcementLearning } from './lessons/reinforcement-learning.js';
import { mlSystemDesign } from './lessons/ml-system-design.js';
import { aiCareerAccelerator } from './lessons/ai-career-accelerator.js';

export const TOPIC_LESSONS: Record<string, TopicLesson> = {
  ...engineeringMathematics,
  ...digitalLogic,
  ...computerOrganization,
  ...programmingAndDataStructures,
  ...algorithms,
  ...theoryOfComputation,
  ...operatingSystems,
  ...compilerDesign,
  ...databaseManagementSystems,
  ...computerNetworks,
  ...generalAptitudeAndGateStrategy,
  ...pyqMarathonsAndTestStrategy,
  ...webFoundations,
  ...engineeringFoundations,
  ...javascriptAndTypeScript,
  ...designForEngineers,
  ...reactEcosystem,
  ...backendWithNodeJs,
  ...dataAndPersistence,
  ...productionEngineering,
  ...systemDesign,
  ...advancedFrontend,
  ...testingAndDelivery,
  ...pythonAndDataFoundations,
  ...dataEngineeringEssentials,
  ...mathAndStatisticsForMl,
  ...classicalMachineLearning,
  ...deepLearning,
  ...nlpAndLanguageModels,
  ...generativeAiApplications,
  ...mlopsAndProductionAi,
  ...computerVisionInDepth,
  ...reinforcementLearning,
  ...mlSystemDesign,
  ...aiCareerAccelerator,
};

export function lessonFor(topicId: string): TopicLesson | undefined {
  return TOPIC_LESSONS[topicId];
}

/** Build-time integrity: every topic id in the curriculum must be authored. */
export function missingLessonIds(topicIds: string[]): string[] {
  return topicIds.filter((id) => !TOPIC_LESSONS[id]);
}

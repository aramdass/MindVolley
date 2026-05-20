# MindGrid Cognitive Fitness Mockup

MindGrid is a static prototype for a daily cognitive wellness battery. It is not a clinical assessment and should not be used for diagnosis.

## Research Basis

The battery follows the six broad cognitive domains emphasized in the NIH Toolbox Cognition Battery: attention, episodic memory, working memory, language, executive function, and processing speed. NIH Toolbox examples include Flanker Inhibitory Control and Attention, Picture Sequence Memory, List Sorting Working Memory, Picture Vocabulary, Oral Reading Recognition, Dimensional Change Card Sort, and Pattern Comparison Processing Speed.

The mockup also borrows from common neuropsychological task families:

- Attention: Flanker-style center-target judgment under distractors.
- Episodic memory: picture sequence recall.
- Working memory: reverse digit span.
- Language: vocabulary synonym recognition.
- Executive function: Trail Making-style alternating sequence.
- Processing speed: rapid same/different pattern comparison.

## Scoring

Each mini-game produces a 0-100 score from accuracy and, where appropriate, completion speed. The overall mental fitness score averages completed domain scores and applies a small penalty when the full six-game battery has not been completed.

## Files

- `index.html`: app shell and content
- `styles.css`: responsive interface styling
- `script.js`: game logic and scoring
- `assets/neural-grid.svg`: visual asset used in the first viewport

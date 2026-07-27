// Simplified heuristic, not medical/nutrition advice: protein doesn't
// actually get "targeted" to a specific muscle, but a rough per-set bonus
// is a reasonable proxy for "you trained this harder today, eat a bit more
// to support it" and is easy to explain in the UI.
const MUSCLE_GROUPS = ["chest", "back", "legs", "shoulders", "arms", "core"];

const PROTEIN_GRAMS_PER_SET = 3;
const CARBS_GRAMS_PER_SET = 2;

// Diminishing returns: sets beyond this per muscle group per day don't add
// more recommended protein/carbs.
const MAX_SETS_COUNTED_PER_GROUP = 12;

function summarizeSetsByMuscleGroup(workouts) {
  const setsByGroup = Object.fromEntries(MUSCLE_GROUPS.map((group) => [group, 0]));

  for (const workout of workouts) {
    for (const exercise of workout.exercises || []) {
      if (setsByGroup[exercise.muscleGroup] !== undefined) {
        setsByGroup[exercise.muscleGroup] += exercise.sets || 0;
      }
    }
  }

  return setsByGroup;
}

function getMuscleGroupBonuses(workouts) {
  const setsByGroup = summarizeSetsByMuscleGroup(workouts);

  return Object.entries(setsByGroup)
    .filter(([, sets]) => sets > 0)
    .map(([muscleGroup, sets]) => {
      const countedSets = Math.min(sets, MAX_SETS_COUNTED_PER_GROUP);
      return {
        muscleGroup,
        setsLogged: sets,
        proteinBonus: countedSets * PROTEIN_GRAMS_PER_SET,
        carbsBonus: countedSets * CARBS_GRAMS_PER_SET,
      };
    });
}

module.exports = {
  MUSCLE_GROUPS,
  PROTEIN_GRAMS_PER_SET,
  CARBS_GRAMS_PER_SET,
  MAX_SETS_COUNTED_PER_GROUP,
  summarizeSetsByMuscleGroup,
  getMuscleGroupBonuses,
};

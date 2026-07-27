const {
  getMuscleGroupBonuses,
  summarizeSetsByMuscleGroup,
  PROTEIN_GRAMS_PER_SET,
  CARBS_GRAMS_PER_SET,
  MAX_SETS_COUNTED_PER_GROUP,
} = require("../utils/muscleNutrition");

describe("summarizeSetsByMuscleGroup", () => {
  it("returns zero for every group when there are no workouts", () => {
    const result = summarizeSetsByMuscleGroup([]);
    expect(Object.values(result).every((sets) => sets === 0)).toBe(true);
  });

  it("sums sets across multiple workouts and exercises for the same group", () => {
    const workouts = [
      { exercises: [{ muscleGroup: "legs", sets: 4 }, { muscleGroup: "chest", sets: 3 }] },
      { exercises: [{ muscleGroup: "legs", sets: 5 }] },
    ];

    const result = summarizeSetsByMuscleGroup(workouts);

    expect(result.legs).toBe(9);
    expect(result.chest).toBe(3);
    expect(result.back).toBe(0);
  });

  it("ignores exercises with an unrecognized muscle group", () => {
    const workouts = [{ exercises: [{ muscleGroup: "not-a-real-group", sets: 10 }] }];
    const result = summarizeSetsByMuscleGroup(workouts);
    expect(Object.values(result).every((sets) => sets === 0)).toBe(true);
  });
});

describe("getMuscleGroupBonuses", () => {
  it("only includes muscle groups with at least one logged set", () => {
    const workouts = [{ exercises: [{ muscleGroup: "back", sets: 6 }] }];
    const bonuses = getMuscleGroupBonuses(workouts);

    expect(bonuses).toHaveLength(1);
    expect(bonuses[0]).toEqual({
      muscleGroup: "back",
      setsLogged: 6,
      proteinBonus: 6 * PROTEIN_GRAMS_PER_SET,
      carbsBonus: 6 * CARBS_GRAMS_PER_SET,
    });
  });

  it("caps the bonus at MAX_SETS_COUNTED_PER_GROUP even if more sets were logged", () => {
    const overCap = MAX_SETS_COUNTED_PER_GROUP + 8;
    const workouts = [{ exercises: [{ muscleGroup: "arms", sets: overCap }] }];

    const [bonus] = getMuscleGroupBonuses(workouts);

    expect(bonus.setsLogged).toBe(overCap);
    expect(bonus.proteinBonus).toBe(MAX_SETS_COUNTED_PER_GROUP * PROTEIN_GRAMS_PER_SET);
    expect(bonus.carbsBonus).toBe(MAX_SETS_COUNTED_PER_GROUP * CARBS_GRAMS_PER_SET);
  });

  it("returns an entry per trained muscle group for a mixed session", () => {
    const workouts = [
      {
        exercises: [
          { muscleGroup: "chest", sets: 3 },
          { muscleGroup: "shoulders", sets: 3 },
          { muscleGroup: "arms", sets: 2 },
        ],
      },
    ];

    const bonuses = getMuscleGroupBonuses(workouts);
    const groups = bonuses.map((b) => b.muscleGroup).sort();

    expect(groups).toEqual(["arms", "chest", "shoulders"]);
  });

  it("returns an empty array when nothing was logged", () => {
    expect(getMuscleGroupBonuses([])).toEqual([]);
  });
});

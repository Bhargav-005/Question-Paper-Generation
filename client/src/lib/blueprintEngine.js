
















export const UNIVERSITY_70_MARK_BLUEPRINT = {
  sectionA: [
  { questionNumber: "1", co: "CO1", marks: 2 },
  { questionNumber: "2", co: "CO1", marks: 2 },
  { questionNumber: "3", co: "CO2", marks: 2 },
  { questionNumber: "4", co: "CO3", marks: 2 },
  { questionNumber: "5", co: "CO4", marks: 2 },
  { questionNumber: "6", co: "CO6", marks: 2 },
  { questionNumber: "7", co: "CO5", marks: 2 }],

  sectionB: [
  {
    groupNumber: 1,
    option1: [
    { questionNumber: "8a", co: "CO1", marks: 8 },
    { questionNumber: "8b", co: "CO2", marks: 6 }],

    option2: [
    { questionNumber: "9a", co: "CO1", marks: 8 },
    { questionNumber: "9b", co: "CO2", marks: 6 }]

  },
  {
    groupNumber: 2,
    option1: [
    { questionNumber: "10a", co: "CO3", marks: 8 },
    { questionNumber: "10b", co: "CO2", marks: 6 }],

    option2: [
    { questionNumber: "11a", co: "CO3", marks: 8 },
    { questionNumber: "11b", co: "CO2", marks: 6 }]

  },
  {
    groupNumber: 3,
    option1: [
    { questionNumber: "12a", co: "CO4", marks: 8 },
    { questionNumber: "12b", co: "CO5", marks: 6 }],

    option2: [
    { questionNumber: "13a", co: "CO4", marks: 8 },
    { questionNumber: "13b", co: "CO5", marks: 6 }]

  },
  {
    groupNumber: 4,
    option1: [
    { questionNumber: "14a", co: "CO6", marks: 8 },
    { questionNumber: "14b", co: "CO5", marks: 6 }],

    option2: [
    { questionNumber: "15a", co: "CO6", marks: 8 },
    { questionNumber: "15b", co: "CO5", marks: 6 }]

  }]

};

export function saveBlueprint(paperId, structure) {
  localStorage.setItem(`qgen_blueprint_${paperId}`, JSON.stringify(structure));
}

export function getBlueprint(paperId) {
  const data = localStorage.getItem(`qgen_blueprint_${paperId}`);
  return data ? JSON.parse(data) : null;
}
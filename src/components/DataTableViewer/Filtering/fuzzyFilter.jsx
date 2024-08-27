import {rankItem} from "@tanstack/match-sorter-utils";


const fuzzyFilter=(row,columId,value,addMeta)=>{

  const itemRank= rankItem(row.getValue(columId),value)
  addMeta({itemRank});
  return itemRank.passed;
}
export default fuzzyFilter;
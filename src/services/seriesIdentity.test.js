import {detectSeriesName} from './seriesIdentity';
test.each([
 ['The Witcher 2: Assassins of Kings Enhanced Edition','The Witcher'],
 ['Assassin’s Creed II','Assassin’s Creed'],
 ["Assassin's Creed: Shadows",'Assassin’s Creed'],
 ['Tom Clancy’s Splinter Cell: Chaos Theory',"Tom Clancy's Splinter Cell"],
 ['The Lord of the Rings: The Two Towers','The Lord of the Rings'],
 ['The Legend of Zelda: Breath of the Wild','The Legend of Zelda'],
 ['Halo 2','Halo'],['God of War (2018)','God of War'],
 ['The Guild of Assassins',null],['Haloes of Dawn',null],
 ['The Lord of the Party',null],['A Plague of Monsters',null],
 ['Mystery Island Adventure',null],['Portal Knights', 'Portal Knights'],
])('identifies %s conservatively', (title,expected)=>expect(detectSeriesName(title)).toBe(expected));
test('unknown families require compatible catalogue information',()=>{
 expect(detectSeriesName({name:'Mystery Island II',normalized:{collections:['Mystery Island']}})).toBe('Mystery Island');
 expect(detectSeriesName({name:'Mystery Island II',normalized:{collections:['Assassin’s Creed']}})).toBeNull();
});

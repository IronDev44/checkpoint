import {normalizeBarcode,barcodeKey,barcodeSearchTitle,barcodeLibraryMatches} from './barcodes';
test('GTIN check digits and UPC/EAN equivalence preserve leading zeros',()=>{
 expect(normalizeBarcode('0 45496-590420')).toBe('045496590420');expect(normalizeBarcode('4006381333931')).toBe('4006381333931');expect(normalizeBarcode('4006381333932')).toBeNull();expect(normalizeBarcode('https://4006381333931')).toBeNull();expect(normalizeBarcode('abc045496590420')).toBeNull();expect(barcodeKey('045496590420')).toBe(barcodeKey('0045496590420'));
});
test('a known box finds only matching private library records, excluding trash',()=>{
 expect(barcodeLibraryMatches([{id:'a',physicalBarcode:'045496590420'},{id:'b',physicalBarcode:'0045496590420',_deletedAt:'2026-10-23'},{id:'c',physicalBarcode:'4006381333931'}],'0045496590420').map(g=>g.id)).toEqual(['a']);
 expect(barcodeSearchTitle('The Legend of Zelda: Breath of the Wild (Nintendo Switch)')).toBe('The Legend of Zelda: Breath of the Wild');
});

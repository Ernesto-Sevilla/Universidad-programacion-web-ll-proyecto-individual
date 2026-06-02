//Prueba test
const sum = require('./suma');

test('La función sum debe devolver suma correcta', () => {
    expect(sum(1, 2)).toBe(3);
});
//Expect Toma el resultado - toBe verifica el valor esperado
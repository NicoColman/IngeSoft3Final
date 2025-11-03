Feature('App');

Scenario('Home renders and can type in input', async ({ I }) => {
  I.amOnPage('/');
  I.see('Items');
  I.fillField('Nuevo item', 'E2E');
});



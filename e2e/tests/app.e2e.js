Feature('App');


Scenario('Add and remove item', async ({ I }) => {
  const itemName = 'Test Item ' + Date.now();


  I.amOnPage('/');

  I.wait(2);
  I.waitForText('Items', 30);


  // Add item
  I.fillField('Nuevo item', itemName);

  I.wait(1);
  I.click('Agregar');

  I.wait(3);


  // Verify item exists
  I.waitForText(itemName, 30);


  // Delete item
  I.wait(2);
  I.click('Eliminar', locate('li').withText(itemName));

  // Verify item is gone
  I.wait(3);
  I.dontSee(itemName);
});
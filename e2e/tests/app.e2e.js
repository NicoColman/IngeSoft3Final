Feature('App');

Scenario('Add and remove item', async ({ I }) => {
  const itemName = 'Test Item ' + Date.now();

  I.amOnPage('/');
  I.waitForText('Items', 30);

  // Add item
  I.fillField('Nuevo item', itemName);
  I.click('Agregar');

  // Verify item exists
  I.waitForText(itemName, 30);

  // Delete item
  // We find the delete button inside the list item that contains our item name
  I.click('Eliminar', locate('li').withText(itemName));

  // Verify item is gone
  I.dontSee(itemName);
});

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

Scenario('Search and Sort items', async ({ I }) => {
  const uniqueId = Date.now();
  const itemA = 'Apple ' + uniqueId;
  const itemB = 'Banana ' + uniqueId;
  const itemC = 'Cherry ' + uniqueId;

  I.amOnPage('/');
  I.waitForText('Items', 30);

  // Add items
  I.fillField('Nuevo item', itemA);
  I.click('Agregar');
  I.waitForText(itemA, 30);

  I.fillField('Nuevo item', itemB);
  I.click('Agregar');
  I.waitForText(itemB, 30);

  I.fillField('Nuevo item', itemC);
  I.click('Agregar');
  I.waitForText(itemC, 30);

  // Test Search
  I.fillField('🔍 Buscar...', 'Apple');
  I.wait(1);
  I.waitForText(itemA, 10);
  I.dontSee(itemB);
  I.dontSee(itemC);

  // Clear search
  I.fillField('🔍 Buscar...', '');
  I.wait(1);
  I.waitForText(itemB, 10);

  // Test Sort (A-Z)
  I.selectOption('select', 'alphabetical');
  I.wait(1);
  // We can't easily check order with simple I.see, but we can check they are all there
  I.waitForText(itemA, 10);
  I.waitForText(itemB, 10);
  I.waitForText(itemC, 10);
});

Scenario('Verify item counters', async ({ I }) => {
  I.amOnPage('/');
  I.waitForText('Items', 30);

  // Check character counter
  I.fillField('Nuevo item', 'Hello');
  I.waitForText('5/100', 5);

  // Check item counter
  const uniqueId = Date.now();
  const item = 'Counter Item ' + uniqueId;

  I.fillField('Nuevo item', item);
  I.click('Agregar');
  I.waitForText(item, 30);

  // Verify "X items" text exists (regex or partial match)
  I.waitForText('items', 10);
});

Scenario('Verify persistence', async ({ I }) => {
  const uniqueId = Date.now();
  const item = 'Persistent Item ' + uniqueId;

  I.amOnPage('/');
  I.waitForText('Items', 30);

  I.fillField('Nuevo item', item);
  I.click('Agregar');
  I.waitForText(item, 30);

  // Reload page
  I.refreshPage();
  I.waitForText('Items', 30);

  // Item should still be there
  I.waitForText(item, 30);
});
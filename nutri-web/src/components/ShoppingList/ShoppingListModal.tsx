import React, { useState, useMemo } from 'react';
import { Modal, Button, Tab, Tabs, Row, Col, Badge, Alert, Form } from 'react-bootstrap';
import { ShoppingCart, Download, Printer } from 'lucide-react';
import type { WeeklyPlan } from '../../types/diet';
import type { WeeklyShoppingList, ShoppingListItem } from '../../types/recipe';
import { INGREDIENT_CATEGORIES } from '../../types/recipe';

interface ShoppingListModalProps {
  show: boolean;
  onHide: () => void;
  weeklyPlan: WeeklyPlan | null;
  patientName: string;
}

export const ShoppingListModal: React.FC<ShoppingListModalProps> = ({
  show,
  onHide,
  weeklyPlan,
  patientName
}) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<string>('list');
  const [groupByCategory, setGroupByCategory] = useState(true);

  // Generar lista de compras consolidada
  const shoppingList: WeeklyShoppingList | null = useMemo(() => {
    if (!weeklyPlan) return null;

    const ingredientMap = new Map<string, ShoppingListItem>();

    // Procesar ALIMENTOS INDIVIDUALES del plan semanal
    const meals = weeklyPlan.meals || [];
    (meals as any[]).forEach((meal: any) => {
      console.log(`🍽️ Procesando comida: ${meal.day} - ${meal.meal_type}`);

      // Procesar alimentos individuales
      if (meal.foods && meal.foods.length > 0) {
        console.log(`🍎 Encontrados ${meal.foods.length} alimentos en esta comida`);

        meal.foods.forEach((mealFood: any) => {
          const foodName = mealFood.food_name || 'Alimento';
          const quantity = mealFood.quantity_grams || 100;

          // Determinar categoría basada en el nombre del alimento
          let category = INGREDIENT_CATEGORIES.find(c => c.id === 'others');

          const foodNameLower = foodName.toLowerCase();
          if (foodNameLower.includes('pollo') || foodNameLower.includes('carne') || foodNameLower.includes('pescado') || foodNameLower.includes('salmón') || foodNameLower.includes('huevo')) {
            category = INGREDIENT_CATEGORIES.find(c => c.id === 'proteins');
          } else if (foodNameLower.includes('leche') || foodNameLower.includes('queso') || foodNameLower.includes('yogur')) {
            category = INGREDIENT_CATEGORIES.find(c => c.id === 'dairy');
          } else if (foodNameLower.includes('tomate') || foodNameLower.includes('lechuga') || foodNameLower.includes('pepino') || foodNameLower.includes('zanahoria') || foodNameLower.includes('brócoli') || foodNameLower.includes('espinaca')) {
            category = INGREDIENT_CATEGORIES.find(c => c.id === 'vegetables');
          } else if (foodNameLower.includes('manzana') || foodNameLower.includes('plátano') || foodNameLower.includes('naranja') || foodNameLower.includes('aguacate')) {
            category = INGREDIENT_CATEGORIES.find(c => c.id === 'fruits');
          } else if (foodNameLower.includes('arroz') || foodNameLower.includes('pan') || foodNameLower.includes('avena') || foodNameLower.includes('quinoa') || foodNameLower.includes('papa')) {
            category = INGREDIENT_CATEGORIES.find(c => c.id === 'grains');
          } else if (foodNameLower.includes('aceite')) {
            category = INGREDIENT_CATEGORIES.find(c => c.id === 'oils');
          } else if (foodNameLower.includes('frijol') || foodNameLower.includes('lenteja')) {
            category = INGREDIENT_CATEGORIES.find(c => c.id === 'legumes');
          } else if (foodNameLower.includes('almendra') || foodNameLower.includes('nuez')) {
            category = INGREDIENT_CATEGORIES.find(c => c.id === 'others');
          }

          if (!category) category = INGREDIENT_CATEGORIES[0];

          const key = `${foodName}-g`;

          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key)!;
            existing.total_quantity += quantity;
            const mealLabel = `${meal.day} ${meal.meal_type}`;
            if (!existing.recipes_using.includes(mealLabel)) {
              existing.recipes_using.push(mealLabel);
            }
          } else {
            ingredientMap.set(key, {
              ingredient_name: foodName,
              category: category,
              total_quantity: quantity,
              unit: {
                id: 'g',
                name: 'gramo',
                abbreviation: 'g',
                category: 'weight'
              },
              recipes_using: [`${meal.day} ${meal.meal_type}`]
            });
          }

          console.log(`✅ Agregado a lista: ${foodName} - ${quantity}g`);
        });
      }

      // Procesar RECETAS (con sus ingredientes si los tienen)
      if (meal.recipes && meal.recipes.length > 0) {
        console.log(`🍳 Encontradas ${meal.recipes.length} recetas en esta comida`);

        meal.recipes.forEach((mealRecipe: any) => {
          // Si la receta tiene ingredientes definidos, usarlos
          if (mealRecipe.recipe_data && mealRecipe.recipe_data.ingredients && mealRecipe.recipe_data.ingredients.length > 0) {
            console.log(`📝 Receta "${mealRecipe.recipe_name}" tiene ${mealRecipe.recipe_data.ingredients.length} ingredientes definidos`);

            mealRecipe.recipe_data.ingredients.forEach((ingredient: any) => {
              const adjustedQuantity = (ingredient.shopping_quantity || ingredient.quantity || 100) * (mealRecipe.servings || 1);
              const key = `${ingredient.food_name || ingredient.ingredient_name}-${ingredient.shopping_unit?.abbreviation || ingredient.unit || 'g'}`;

              if (ingredientMap.has(key)) {
                const existing = ingredientMap.get(key)!;
                existing.total_quantity += adjustedQuantity;
                if (!existing.recipes_using.includes(mealRecipe.recipe_name)) {
                  existing.recipes_using.push(mealRecipe.recipe_name);
                }
              } else {
                ingredientMap.set(key, {
                  ingredient_name: ingredient.food_name || ingredient.ingredient_name || 'Ingrediente',
                  category: ingredient.category || INGREDIENT_CATEGORIES.find(c => c.id === 'others') || INGREDIENT_CATEGORIES[0],
                  total_quantity: adjustedQuantity,
                  unit: ingredient.shopping_unit || {
                    id: ingredient.unit || 'g',
                    name: ingredient.unit || 'gramo',
                    abbreviation: ingredient.unit || 'g',
                    category: 'weight'
                  },
                  recipes_using: [mealRecipe.recipe_name]
                });
              }
            });
          } else {
            // Si la receta no tiene ingredientes definidos, crear un item genérico
            console.log(`⚠️ Receta "${mealRecipe.recipe_name}" no tiene ingredientes definidos - creando item genérico`);

            const key = `Receta: ${mealRecipe.recipe_name}-porción`;

            if (ingredientMap.has(key)) {
              const existing = ingredientMap.get(key)!;
              existing.total_quantity += (mealRecipe.servings || 1);
              const mealLabel = `${meal.day} ${meal.meal_type}`;
              if (!existing.recipes_using.includes(mealLabel)) {
                existing.recipes_using.push(mealLabel);
              }
            } else {
              ingredientMap.set(key, {
                ingredient_name: `Receta: ${mealRecipe.recipe_name}`,
                category: INGREDIENT_CATEGORIES.find(c => c.id === 'others') || INGREDIENT_CATEGORIES[0],
                total_quantity: mealRecipe.servings || 1,
                unit: {
                  id: 'portion',
                  name: 'porción',
                  abbreviation: 'porción',
                  category: 'pieces'
                },
                recipes_using: [`${meal.day} ${meal.meal_type}`]
              });
            }
          }
        });
      }
    });

    console.log(`🛒 Lista de compras generada con ${ingredientMap.size} items únicos`);
    console.log('📋 Items en lista:', Array.from(ingredientMap.keys()));

    return {
      week_number: weeklyPlan.week_number,
      patient_name: patientName,
      generated_date: new Date().toISOString(),
      items: Array.from(ingredientMap.values()),
      categories: INGREDIENT_CATEGORIES
    };
  }, [weeklyPlan, patientName]);

  // Agrupar items por categoría si está habilitado
  const groupedItems = useMemo(() => {
    if (!shoppingList || !groupByCategory) {
      return shoppingList?.items || [];
    }

    const groups = new Map<string, ShoppingListItem[]>();

    shoppingList.items.forEach(item => {
      const categoryId = item.category.id;
      if (!groups.has(categoryId)) {
        groups.set(categoryId, []);
      }
      groups.get(categoryId)!.push(item);
    });

    // Ordenar categorías y crear lista plana ordenada
    const sortedCategories = INGREDIENT_CATEGORIES.sort((a, b) => a.sort_order - b.sort_order);
    const result: ShoppingListItem[] = [];

    sortedCategories.forEach(category => {
      const items = groups.get(category.id) || [];
      if (items.length > 0) {
        result.push(...items.sort((a, b) => a.ingredient_name.localeCompare(b.ingredient_name)));
      }
    });

    return result;
  }, [shoppingList, groupByCategory]);

  const toggleItemCheck = (itemName: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemName)) {
      newChecked.delete(itemName);
    } else {
      newChecked.add(itemName);
    }
    setCheckedItems(newChecked);
  };

  const generatePrintableList = () => {
    if (!shoppingList) return;

    const printContent = `
      <html>
        <head>
          <title>Lista de Compras - ${patientName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .category { margin-bottom: 20px; }
            .category-title { 
              background-color: #f8f9fa; 
              padding: 8px; 
              font-weight: bold; 
              border-left: 4px solid #007bff;
            }
            .item { padding: 5px 15px; border-bottom: 1px dotted #ccc; }
            .checkbox { margin-right: 10px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>🛒 Lista de Compras</h2>
            <p><strong>Paciente:</strong> ${patientName}</p>
            <p><strong>Semana:</strong> ${shoppingList.week_number}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
          </div>
          
          ${INGREDIENT_CATEGORIES.map(category => {
      const categoryItems = shoppingList.items.filter(item => item.category.id === category.id);
      if (categoryItems.length === 0) return '';

      return `
              <div class="category">
                <div class="category-title">${category.icon} ${category.display_name}</div>
                ${categoryItems.map(item => `
                  <div class="item">
                    <input type="checkbox" class="checkbox">
                    <strong>${item.ingredient_name}</strong> - 
                    ${Math.round(item.total_quantity * 10) / 10} ${item.unit.abbreviation}
                    <br><small style="color: #666;">Para: ${item.recipes_using.join(', ')}</small>
                  </div>
                `).join('')}
              </div>
            `;
    }).join('')}
          
          <div style="margin-top: 30px; text-align: center; color: #666;">
            <small>Lista generada automáticamente por Litam</small>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (!shoppingList) {
    return (
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Lista de Compras</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            No hay datos suficientes para generar una lista de compras.
            Asegúrate de que el plan semanal tenga recetas con ingredientes definidos.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <ShoppingCart className="me-2" size={24} />
          Lista de Compras - Semana {shoppingList.week_number}
          <Badge bg="primary" className="ms-2">{shoppingList.items.length} items</Badge>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <div className="mb-3">
          <Row>
            <Col md={6}>
              <h6>👤 {patientName}</h6>
              <small className="text-muted">
                Generada el {new Date(shoppingList.generated_date).toLocaleDateString('es-ES')}
              </small>
            </Col>
            <Col md={6} className="text-end">
              <Form.Check
                type="switch"
                id="group-by-category"
                label="Agrupar por categorías"
                checked={groupByCategory}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGroupByCategory(e.target.checked)}
                className="d-inline-block me-3"
              />
              <Badge bg="success">{checkedItems.size} completados</Badge>
            </Col>
          </Row>
        </div>

        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'list')}>
          <Tab eventKey="list" title="🛒 Lista Principal">
            <div className="mt-3">
              {groupByCategory ? (
                // Vista agrupada por categorías
                INGREDIENT_CATEGORIES.map(category => {
                  const categoryItems = shoppingList.items.filter(item => item.category.id === category.id);
                  if (categoryItems.length === 0) return null;

                  return (
                    <div key={category.id} className="mb-4">
                      <div className="bg-light p-2 rounded-top d-flex align-items-center">
                        <span className="me-2" style={{ fontSize: '1.2em' }}>{category.icon}</span>
                        <strong>{category.display_name}</strong>
                        <Badge bg="secondary" className="ms-2">{categoryItems.length}</Badge>
                      </div>
                      <div className="border border-top-0 rounded-bottom">
                        {categoryItems.map((item, index) => (
                          <div
                            key={index}
                            className={`p-3 border-bottom d-flex align-items-center ${checkedItems.has(item.ingredient_name) ? 'bg-light text-decoration-line-through' : ''
                              }`}
                          >
                            <Form.Check
                              type="checkbox"
                              checked={checkedItems.has(item.ingredient_name)}
                              onChange={() => toggleItemCheck(item.ingredient_name)}
                              className="me-3"
                            />
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <strong>{item.ingredient_name}</strong>
                                  <div className="text-primary">
                                    {Math.round(item.total_quantity * 10) / 10} {item.unit.abbreviation}
                                  </div>
                                  <small className="text-muted">
                                    Para: {item.recipes_using.join(', ')}
                                  </small>
                                </div>
                                {item.brand_preference && (
                                  <Badge bg="outline-info" className="ms-2">
                                    {item.brand_preference}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                // Vista de lista simple
                <div className="border rounded">
                  {groupedItems.map((item, index) => (
                    <div
                      key={index}
                      className={`p-3 border-bottom d-flex align-items-center ${checkedItems.has(item.ingredient_name) ? 'bg-light text-decoration-line-through' : ''
                        }`}
                    >
                      <Form.Check
                        type="checkbox"
                        checked={checkedItems.has(item.ingredient_name)}
                        onChange={() => toggleItemCheck(item.ingredient_name)}
                        className="me-3"
                      />
                      <span className="me-2">{item.category.icon}</span>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <strong>{item.ingredient_name}</strong>
                            <div className="text-primary">
                              {Math.round(item.total_quantity * 10) / 10} {item.unit.abbreviation}
                            </div>
                            <small className="text-muted">
                              Para: {item.recipes_using.join(', ')}
                            </small>
                          </div>
                          <Badge bg="outline-secondary">{item.category.display_name}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Tab>

          <Tab eventKey="summary" title="📊 Resumen">
            <div className="mt-3">
              <Row>
                {INGREDIENT_CATEGORIES.map(category => {
                  const categoryItems = shoppingList.items.filter(item => item.category.id === category.id);
                  if (categoryItems.length === 0) return null;

                  return (
                    <Col md={6} lg={4} key={category.id} className="mb-3">
                      <div className="border rounded p-3">
                        <div className="d-flex align-items-center mb-2">
                          <span className="me-2" style={{ fontSize: '1.5em' }}>{category.icon}</span>
                          <strong>{category.display_name}</strong>
                        </div>
                        <Badge bg="primary">{categoryItems.length} items</Badge>
                        <div className="mt-2">
                          {categoryItems.slice(0, 3).map((item, index) => (
                            <div key={index} className="small text-muted">
                              • {item.ingredient_name}
                            </div>
                          ))}
                          {categoryItems.length > 3 && (
                            <div className="small text-muted">
                              ... y {categoryItems.length - 3} más
                            </div>
                          )}
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>

              <div className="bg-light p-3 rounded mt-3">
                <h6>📈 Estadísticas</h6>
                <Row>
                  <Col md={3}>
                    <div className="text-center">
                      <div className="h4 text-primary">{shoppingList.items.length}</div>
                      <small className="text-muted">Items totales</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <div className="h4 text-success">{checkedItems.size}</div>
                      <small className="text-muted">Completados</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <div className="h4 text-warning">
                        {Math.round((checkedItems.size / shoppingList.items.length) * 100)}%
                      </div>
                      <small className="text-muted">Progreso</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="text-center">
                      <div className="h4 text-info">
                        {new Set(shoppingList.items.flatMap(item => item.recipes_using)).size}
                      </div>
                      <small className="text-muted">Recetas</small>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </Tab>
        </Tabs>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Cerrar
        </Button>
        <Button variant="outline-primary" onClick={generatePrintableList}>
          <Printer size={16} className="me-1" />
          Imprimir Lista
        </Button>
        <Button variant="primary" onClick={() => {
          // Aquí se podría implementar la descarga como PDF o envío por email
          alert('Funcionalidad de descarga/envío por email en desarrollo');
        }}>
          <Download size={16} className="me-1" />
          Descargar/Enviar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}; 
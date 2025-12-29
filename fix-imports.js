// Script para corregir imports no utilizados
const fs = require('fs');
const path = require('path');

const fixes = [
    {
        file: 'nutri-web/src/components/MealEditorModal.tsx',
        search: "import React, { useState } from 'react';",
        replace: "import { useState } from 'react';"
    },
    {
        file: 'nutri-web/src/components/MealPlanner/MealPlannerHeader.tsx',
        search: "import { Modal } from 'react-bootstrap';",
        replace: ""
    },
    {
        file: 'nutri-web/src/components/MealPlanner/MealPlannerToolbar.tsx',
        search: "    ShoppingCart,\n",
        replace: ""
    },
    {
        file: 'nutri-web/src/components/MealPlanner/WeeklyMealGrid.tsx',
        search: "    MoreVertical,\n",
        replace: ""
    },
    {
        file: 'nutri-web/src/components/MealPlanner/WeeklyMealGrid.tsx',
        search: "import { Button } from 'react-bootstrap';\nimport { Dropdown } from 'react-bootstrap';",
        replace: ""
    },
    {
        file: 'nutri-web/src/components/MealPlanner/WeeklyMealGrid.tsx',
        search: "import type { Meal, MealFood, MealRecipe } from '../../hooks/useMealPlanner';",
        replace: "import type { Meal } from '../../hooks/useMealPlanner';"
    },
    {
        file: 'nutri-web/src/components/NutritionalCard/SimpleSections/SimpleNutritionTab.tsx',
        search: "    PieChart,\n",
        replace: ""
    },
    {
        file: 'nutri-web/src/components/NutritionalCard/SimpleSections/SimpleNutritionTab.tsx',
        search: "    ArrowUpRight,\n",
        replace: ""
    },
    {
        file: 'nutri-web/src/components/NutritionalCard/SimpleSections/SimpleRestrictionsTab.tsx',
        search: "    Check,\n",
        replace: ""
    },
    {
        file: 'nutri-web/src/components/NutritionalCard/SimpleSections/SimpleScheduleTab.tsx',
        search: "    Calendar,\n",
        replace: ""
    },
    {
        file: 'nutri-web/src/components/NutritionalCard/SimpleSections/SimpleScheduleTab.tsx',
        search: "    AlertCircle,\n",
        replace: ""
    }
];

fixes.forEach(fix => {
    const filePath = path.join(__dirname, fix.file);
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(fix.search, fix.replace);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed: ${fix.file}`);
    } catch (error) {
        console.error(`❌ Error fixing ${fix.file}:`, error.message);
    }
});

console.log('✅ All fixes applied!');

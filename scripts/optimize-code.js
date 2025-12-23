// scripts/optimize-code.js
// Script para optimizar y limpiar el código TypeScript

const fs = require('fs');
const path = require('path');

console.log('🔧 INICIANDO OPTIMIZACIÓN MASIVA DEL CÓDIGO...');

// Función para limpiar imports no utilizados de archivos
function cleanUnusedImports(filePath, content) {
  let cleaned = content;
  
  // Patrones de imports no utilizados comunes
  const unusedPatterns = [
    // React Icons no utilizados
    /,\s*MdWarning\s*/g,
    /,\s*MdAccessTime\s*/g,
    /,\s*MdSettings(?![A-Za-z])\s*/g,
    /,\s*MdPeople(?![A-Za-z])\s*/g,
    /,\s*MdAnalytics\s*/g,
    /,\s*MdBuild\s*/g,
    /,\s*MdPhone\s*/g,
    /,\s*MdEmail\s*/g,
    /,\s*MdCalendarToday\s*/g,
    /,\s*MdScale\s*/g,
    /,\s*MdHeight\s*/g,
    /,\s*MdFitnessCenter\s*/g,
    /,\s*MdInfo\s*/g,
    /,\s*MdRefresh\s*/g,
    /,\s*MdAdminPanelSettings\s*/g,
    /,\s*MdHealthAndSafety\s*/g,
    /,\s*MdLocationOn\s*/g,
    /,\s*MdWork\s*/g,
    /,\s*MdSchool\s*/g,
    /,\s*MdAssignment\s*/g,
    /,\s*MdTrendingUp\s*/g,
    /,\s*MdTrendingDown\s*/g,
    /,\s*FaUserShield\s*/g,
    /,\s*FaExclamationTriangle\s*/g,
    /,\s*FaCheckCircle\s*/g,
    /,\s*FaInfoCircle\s*/g,
    /,\s*FaClock\s*/g,
    /,\s*FaTachometerAlt\s*/g,
    /,\s*FaHdd\s*/g,
    /,\s*FaMemory\s*/g,
    /,\s*FaMicrochip\s*/g,
    /,\s*FaUserPlus\s*/g,
    /,\s*FaUserMd\s*/g,
    /,\s*FaUsers(?=\s*\})/g,
    // Lucide React
    /,\s*Filter\s*/g,
    /,\s*Archive\s*/g,
    /,\s*Star\s*/g,
    /,\s*StarOff\s*/g,
    /,\s*FileText\s*/g,
    /,\s*TrendingUp\s*/g,
    /,\s*Activity\s*/g,
    /,\s*Eye\s*/g,
    /,\s*EyeOff\s*/g,
    /,\s*User\s*/g,
    /,\s*Heart\s*/g,
    /,\s*Minus\s*/g,
    /,\s*Home\s*/g,
    /,\s*MessageSquare\s*/g,
    /,\s*CheckCircle\s*/g,
    // Bootstrap imports
    /,\s*Alert\s*/g,
    /,\s*Badge(?=\s*[,\}])\s*/g,
    /,\s*Form(?=\s*[,\}])\s*/g,
    /,\s*Pagination\s*/g,
    /,\s*ProgressBar\s*/g,
    /,\s*Spinner(?=\s*[,\}])\s*/g,
    /,\s*Offcanvas\s*/g,
    /,\s*ListGroup\s*/g,
    /,\s*ListGroupItem\s*/g,
    // React hooks no utilizados
    /,\s*useEffect(?=\s*[,\}])/g,
    /,\s*useCallback(?=\s*[,\}])/g,
  ];

  // Aplicar limpieza de patrones
  unusedPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // Limpiar imports vacíos al principio de líneas
  cleaned = cleaned.replace(/^\s*,\s*/gm, '');
  
  // Limpiar comas duplicadas
  cleaned = cleaned.replace(/,\s*,/g, ',');
  
  // Limpiar espacios extra en imports
  cleaned = cleaned.replace(/\{\s*,/g, '{');
  cleaned = cleaned.replace(/,\s*\}/g, '}');

  return cleaned;
}

// Función para limpiar variables no utilizadas
function cleanUnusedVariables(content) {
  let cleaned = content;
  
  // Patrones de variables no utilizadas comunes
  const unusedVarPatterns = [
    // Estados no utilizados
    /const \[error, setError\] = useState<string \| null>\(null\);\s*/g,
    /const \[loading, setLoading\] = useState\(false\);\s*/g,
    /const \[currentPage, setCurrentPage\] = useState\(1\);\s*/g,
    /const \[totalPages, setTotalPages\] = useState\(1\);\s*/g,
    // Funciones no utilizadas
    /const getProgressColor = \(percentage: number\) => \{[^}]+\};\s*/g,
    /const getCompletionRate = \([^)]+\) => \{[^}]+\};\s*/g,
    /const selectAll = \(\) => \{[^}]+\};\s*/g,
    /const playNotificationSound = \(\) => \{[^}]+\};\s*/g,
    /const deleteNotification = \([^)]+\) => \{[^}]+\};\s*/g,
    /const handleNotificationsClose = \(\) => \{[^}]+\};\s*/g,
    /const handleReschedule = \([^)]+\) => \{[^}]+\};\s*/g,
    /const handleUpdateRecord = async \([^)]+\) => \{[^}]+\};\s*/g,
    /const handleCreateSeguimiento = async \(data: any\) => \{[^}]+\};\s*/g,
  ];

  unusedVarPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '// Variable/función removida - no utilizada\n');
  });

  return cleaned;
}

// Función para arreglar problemas de tipos comunes
function fixTypeIssues(content) {
  let fixed = content;
  
  // Arreglar problemas de tipos con data
  fixed = fixed.replace(
    /return response\.data\?\.data \|\| response\.data;/g,
    'return (response as any).data?.data || (response as any).data;'
  );
  
  // Arreglar referencias a X no definida
  fixed = fixed.replace(
    /<X size={14} className="me-1" \/>/g,
    '<span className="me-1">✕</span>'
  );

  // Arreglar práctica state en ProfilePage
  fixed = fixed.replace(
    /practice: \{\s*\}/g,
    'practice: {\n          clinic_address: "",\n          consultation_hours: "",\n          bio: "",\n          professional_summary: ""\n        }'
  );

  return fixed;
}

// Función para procesar un archivo
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let processed = content;
    
    // Aplicar optimizaciones
    processed = cleanUnusedImports(filePath, processed);
    processed = cleanUnusedVariables(processed);
    processed = fixTypeIssues(processed);
    
    // Solo escribir si hay cambios
    if (processed !== content) {
      fs.writeFileSync(filePath, processed, 'utf8');
      console.log(`✅ Optimizado: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

// Función para procesar directorio recursivamente
function processDirectory(dirPath, extensions = ['.tsx', '.ts']) {
  let filesProcessed = 0;
  let filesOptimized = 0;
  
  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Saltar node_modules y otros directorios
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          walkDir(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(fullPath);
        if (extensions.includes(ext)) {
          filesProcessed++;
          if (processFile(fullPath)) {
            filesOptimized++;
          }
        }
      }
    }
  }
  
  walkDir(dirPath);
  return { filesProcessed, filesOptimized };
}

// Ejecutar optimización
function main() {
  const srcPath = path.join(process.cwd(), 'src');
  
  if (!fs.existsSync(srcPath)) {
    console.error('❌ Directorio src no encontrado');
    return;
  }
  
  console.log('📁 Procesando archivos en:', srcPath);
  
  const result = processDirectory(srcPath);
  
  console.log('\n🎉 OPTIMIZACIÓN COMPLETADA');
  console.log(`📊 Archivos procesados: ${result.filesProcessed}`);
  console.log(`✨ Archivos optimizados: ${result.filesOptimized}`);
  console.log(`💡 Archivos sin cambios: ${result.filesProcessed - result.filesOptimized}`);
  
  if (result.filesOptimized > 0) {
    console.log('\n🚀 Ejecuta "npm run build" para verificar las correcciones');
  } else {
    console.log('\n✅ No se requirieron optimizaciones adicionales');
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = { processFile, processDirectory };
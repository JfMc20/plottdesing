#!/usr/bin/env node

/**
 * Script de Prueba Exhaustivo para Productos Customizables
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Colores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logTest(testName) {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`)
  console.log(`${colors.blue}🧪 TEST: ${testName}${colors.reset}`)
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`)
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan')
}

const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
}

async function runTest(testName, testFn) {
  stats.total++
  try {
    await testFn()
    stats.passed++
    logSuccess(`PASSED: ${testName}`)
    return true
  } catch (error) {
    stats.failed++
    stats.errors.push({ test: testName, error: error.message })
    logError(`FAILED: ${testName}`)
    logError(`Error: ${error.message}`)
    return false
  }
}

async function testDatabaseSchema() {
  logTest('Database Schema Validation')

  // Test 1: CustomizationRequest model exists
  await runTest('Schema - CustomizationRequest model exists', async () => {
    const count = await prisma.customizationRequest.count()
    logInfo(`Found ${count} customization requests in database`)
  })

  // Test 2: Product has customization flags
  await runTest('Schema - Product has customization flags', async () => {
    const products = await prisma.product.findMany({ take: 1 })
    if (products.length > 0) {
      const product = products[0]
      if (typeof product.isCustomizable !== 'boolean') {
        throw new Error('Product.isCustomizable should be boolean')
      }
      if (typeof product.isPrintOnDemand !== 'boolean') {
        throw new Error('Product.isPrintOnDemand should be boolean')
      }
      logInfo(`Product flags: customizable=${product.isCustomizable}, printOnDemand=${product.isPrintOnDemand}`)
    } else {
      logWarning('No products found in database')
    }
  })

  // Test 3: ProductSize has stock field
  await runTest('Schema - ProductSize has stock field', async () => {
    const sizes = await prisma.productSize.findMany({ take: 1 })
    if (sizes.length > 0) {
      if (typeof sizes[0].stock !== 'number') {
        throw new Error('ProductSize.stock should be a number')
      }
      logInfo(`ProductSize stock field exists: ${sizes[0].stock}`)
    } else {
      logWarning('No ProductSize records found')
    }
  })

  // Test 4: Product relation to CustomizationRequest
  await runTest('Schema - Product relation exists', async () => {
    const products = await prisma.product.findMany({
      where: { isCustomizable: true },
      take: 1,
      include: {
        customizationRequests: true
      }
    })
    
    if (products.length === 0) {
      logWarning('No customizable products found in database')
    } else {
      logInfo(`Found ${products.length} customizable product(s)`)
      logInfo(`Product has ${products[0].customizationRequests.length} requests`)
    }
  })
}

async function testProductData() {
  logTest('Product Data Validation')

  // Test 1: Count customizable products
  await runTest('Data - Count customizable products', async () => {
    const count = await prisma.product.count({
      where: { isCustomizable: true, isAvailable: true }
    })
    logInfo(`Found ${count} customizable products available`)
    
    if (count === 0) {
      throw new Error('No customizable products found. Please create at least one.')
    }
  })

  // Test 2: Products with CategoryItem
  await runTest('Data - Products with CategoryItem', async () => {
    const products = await prisma.product.findMany({
      where: {
        isCustomizable: true,
        categoryItemId: { not: null }
      },
      include: {
        categoryItem: {
          include: {
            ProductSize: true,
            ProductZone: true
          }
        }
      },
      take: 5
    })

    logInfo(`Found ${products.length} products with CategoryItem`)
    
    products.forEach(p => {
      const sizesCount = p.categoryItem?.ProductSize.length || 0
      const zonesCount = p.categoryItem?.ProductZone.length || 0
      logInfo(`  - ${p.title}: ${sizesCount} sizes, ${zonesCount} zones`)
    })

    if (products.length === 0) {
      logWarning('No products with CategoryItem found')
    }
  })

  // Test 3: Products with stock
  await runTest('Data - Products with stock', async () => {
    const withStock = await prisma.product.count({
      where: {
        isCustomizable: true,
        isPrintOnDemand: false,
        stock: { gt: 0 }
      }
    })

    const withSizeStock = await prisma.productSize.count({
      where: { stock: { gt: 0 } }
    })

    logInfo(`Products with general stock: ${withStock}`)
    logInfo(`Sizes with stock: ${withSizeStock}`)
  })

  // Test 4: Print on Demand products
  await runTest('Data - Print on Demand products', async () => {
    const count = await prisma.product.count({
      where: { isPrintOnDemand: true }
    })
    logInfo(`Found ${count} Print on Demand products`)
  })
}

async function testCategoryItems() {
  logTest('CategoryItem Configuration')

  // Test 1: CategoryItems with sizes
  await runTest('CategoryItem - Items with sizes', async () => {
    const items = await prisma.categoryItem.findMany({
      include: {
        ProductSize: true,
        _count: {
          select: { ProductSize: true }
        }
      }
    })

    logInfo(`Found ${items.length} CategoryItems`)
    
    items.forEach(item => {
      logInfo(`  - ${item.name}: ${item._count.ProductSize} sizes`)
    })

    if (items.length === 0) {
      throw new Error('No CategoryItems found. Please create at least one.')
    }
  })

  // Test 2: CategoryItems with zones
  await runTest('CategoryItem - Items with zones', async () => {
    const items = await prisma.categoryItem.findMany({
      include: {
        ProductZone: true,
        _count: {
          select: { ProductZone: true }
        }
      }
    })

    items.forEach(item => {
      logInfo(`  - ${item.name}: ${item._count.ProductZone} zones`)
    })

    const withZones = items.filter(i => i.ProductZone.length > 0)
    if (withZones.length === 0) {
      throw new Error('No CategoryItems with zones found. Please add zones.')
    }
  })
}

async function testStockConfiguration() {
  logTest('Stock Configuration')

  // Test 1: Sizes with stock
  await runTest('Stock - Sizes with stock configured', async () => {
    const sizes = await prisma.productSize.findMany({
      include: {
        CategoryItem: {
          include: {
            Product: true
          }
        }
      }
    })

    const withStock = sizes.filter(s => s.stock > 0)
    const withoutStock = sizes.filter(s => s.stock === 0)

    logInfo(`Total sizes: ${sizes.length}`)
    logInfo(`With stock: ${withStock.length}`)
    logInfo(`Without stock: ${withoutStock.length}`)

    if (withStock.length > 0) {
      logInfo('Sizes with stock:')
      withStock.slice(0, 5).forEach(s => {
        logInfo(`  - ${s.name} (${s.code}): ${s.stock} units`)
      })
    }

    if (withStock.length === 0) {
      logWarning('No sizes have stock configured. Add stock to test properly.')
    }
  })
}

async function main() {
  console.log('\n')
  log('╔════════════════════════════════════════════════════════════╗', 'cyan')
  log('║   PRUEBA EXHAUSTIVA: PRODUCTOS CUSTOMIZABLES              ║', 'cyan')
  log('╚════════════════════════════════════════════════════════════╝', 'cyan')
  console.log('\n')

  logInfo(`Starting tests at: ${new Date().toLocaleString()}`)
  console.log('\n')

  try {
    await testDatabaseSchema()
    await testProductData()
    await testCategoryItems()
    await testStockConfiguration()

    // Resumen
    console.log('\n')
    log('╔════════════════════════════════════════════════════════════╗', 'cyan')
    log('║                    RESUMEN DE PRUEBAS                      ║', 'cyan')
    log('╚════════════════════════════════════════════════════════════╝', 'cyan')
    console.log('\n')

    log(`Total de pruebas: ${stats.total}`, 'blue')
    log(`✅ Exitosas: ${stats.passed}`, 'green')
    log(`❌ Fallidas: ${stats.failed}`, 'red')
    log(`📊 Tasa de éxito: ${((stats.passed / stats.total) * 100).toFixed(2)}%`, 'cyan')

    if (stats.errors.length > 0) {
      console.log('\n')
      log('Errores encontrados:', 'red')
      stats.errors.forEach((err, i) => {
        log(`${i + 1}. ${err.test}`, 'yellow')
        log(`   ${err.error}`, 'red')
      })
    }

    console.log('\n')

  } finally {
    await prisma.$disconnect()
  }

  process.exit(stats.failed > 0 ? 1 : 0)
}

main().catch((error) => {
  logError('Fatal error:')
  console.error(error)
  prisma.$disconnect()
  process.exit(1)
})

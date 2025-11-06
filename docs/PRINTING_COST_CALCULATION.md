# 💰 Cálculo de Costos de Impresión

## ✅ IMPLEMENTADO

### 🎯 Objetivo
Calcular automáticamente el costo de impresión basado en el área del diseño y el costo del material por metro cuadrado.

---

## 📊 Campos Agregados

### **ProductPrintSize Model**
```prisma
model ProductPrintSize {
  // ... campos existentes
  costPerMeter  Float  @default(0)  // Costo por metro cuadrado ($)
  printingCost  Float  @default(0)  // Costo total calculado ($)
}
```

---

## 🧮 Fórmula de Cálculo

```
Área en m² = (ancho en cm × alto en cm) / 10,000
Costo de Impresión = Área en m² × Costo por m²
```

### Ejemplo:
- **Dimensiones**: 30cm × 40cm
- **Área**: 1,200 cm² = 0.12 m²
- **Costo por m²**: $20.00
- **Costo de Impresión**: 0.12 × $20 = **$2.40**

---

## 🎨 Interfaz de Usuario

### **Campos en Print Sizes**
1. **Name** - Nombre del tamaño (ej: "Pequeño")
2. **Width (cm)** - Ancho en centímetros
3. **Height (cm)** - Alto en centímetros
4. **Reference** - Referencia (ej: "A4")
5. **Area (cm²)** - Calculado automáticamente (ancho × alto)
6. **Costo/m²** - Campo editable para ingresar costo por metro cuadrado
7. **Costo Impresión** - Calculado automáticamente

---

## ⚙️ Comportamiento Automático

### **Recalcula cuando cambia:**
- ✅ Width (ancho)
- ✅ Height (alto)
- ✅ Costo por m²

### **Cálculo en tiempo real:**
El costo de impresión se actualiza automáticamente al modificar cualquiera de estos valores.

---

## 📝 Uso

### **1. Configurar Category Item**
1. Ir a `/category-items/[id]`
2. Navegar al tab "Print Zones"
3. Agregar o editar una zona de impresión
4. Agregar tamaños de impresión

### **2. Ingresar Datos**
```
Name: Pequeño
Width: 20 cm
Height: 30 cm
Reference: A5
Costo/m²: $20.00
```

### **3. Resultado Automático**
```
Area: 600.00 cm²
Costo Impresión: $1.20
```

---

## 💡 Casos de Uso

### **Ejemplo 1: Camiseta - Frente**
- Zona: FRONT
- Tamaño: 25cm × 30cm = 750 cm² = 0.075 m²
- Costo/m²: $20
- **Costo**: $1.50

### **Ejemplo 2: Banner Grande**
- Zona: MAIN
- Tamaño: 100cm × 200cm = 20,000 cm² = 2 m²
- Costo/m²: $15
- **Costo**: $30.00

### **Ejemplo 3: Sticker Pequeño**
- Zona: SINGLE
- Tamaño: 5cm × 5cm = 25 cm² = 0.0025 m²
- Costo/m²: $50
- **Costo**: $0.13

---

## 🔄 Integración con Productos

### **Próximos Pasos Sugeridos:**

1. **Precio Final del Producto**
   ```
   Precio Total = Precio Base + Costo de Impresión + Margen
   ```

2. **Selector en Storefront**
   - Usuario selecciona tamaño de impresión
   - Sistema muestra costo adicional
   - Actualiza precio total en carrito

3. **Múltiples Zonas**
   ```
   Costo Total = Σ (Costo de cada zona seleccionada)
   ```

---

## 📁 Archivos Modificados

### **1. Schema Prisma**
```
apps/admin/prisma/schema.prisma
```
- Agregados campos `costPerMeter` y `printingCost`

### **2. Componente UI**
```
apps/admin/src/app/(dashboard)/(routes)/category-items/[id]/components/zones-manager.tsx
```
- Agregados campos de entrada para costo/m²
- Implementada lógica de cálculo automático
- Actualizada grid de 5 a 7 columnas

---

## ✅ Comandos Ejecutados

```bash
# Generar cliente Prisma
cd apps/admin && npx prisma generate

# Aplicar cambios a base de datos
cd apps/admin && npx prisma db push
```

---

## 🎯 Estado: COMPLETADO

- ✅ Schema actualizado
- ✅ Base de datos migrada
- ✅ UI actualizada
- ✅ Cálculos automáticos funcionando
- ✅ Tooltips informativos agregados

---

**Fecha**: 2025-11-06  
**Funcionalidad**: Cálculo automático de costos de impresión basado en área y costo por m²

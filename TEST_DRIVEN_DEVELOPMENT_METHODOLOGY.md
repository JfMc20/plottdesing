# Test-Driven Development (TDD) - Metodología Step-by-Step

## 📋 Descripción General

Esta metodología combina **Test-Driven Development (TDD)**, **Desarrollo Incremental**, y **Desarrollo Interactivo** para crear código de alta calidad con validación inmediata en cada paso.

---

## 🎯 Principios Fundamentales

### 1. **Un Step a la Vez**
- Nunca avanzar al siguiente step sin completar y probar el actual
- Cada step debe ser pequeño, específico y accionable
- Mantener el scope limitado para facilitar debugging

### 2. **Probar Antes de Avanzar**
- Cada implementación debe probarse inmediatamente
- Las pruebas sirven como documentación viva
- El usuario/desarrollador confirma funcionamiento antes de continuar

### 3. **Feedback Continuo**
- Comunicación constante sobre lo que se está haciendo
- Mostrar resultados tangibles en cada iteración
- Ajustar según feedback inmediato

### 4. **Documentación del Proceso**
- Usar TODO lists para trackear progreso
- Documentar cómo probar cada feature
- Mantener registro de decisiones tomadas

---

## 🔄 Flujo de Trabajo (Workflow)

```
┌─────────────────────────────────────────────────────────┐
│  1. 📋 PLANIFICAR                                       │
│     - Crear TODO list con steps específicos             │
│     - Definir criterios de aceptación                   │
│     - Identificar dependencias entre steps              │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  2. 💻 IMPLEMENTAR                                      │
│     - Escribir código para el step actual               │
│     - Seguir patrones existentes del proyecto           │
│     - Comentar decisiones técnicas importantes          │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  3. 🧪 PROPORCIONAR PRUEBAS                             │
│     - Crear scripts de prueba (curl, DevTools, etc)     │
│     - Documentar casos de uso esperados                 │
│     - Incluir casos edge y validación de errores        │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  4. ✅ EJECUTAR Y VALIDAR                               │
│     - Usuario/Dev ejecuta las pruebas                   │
│     - Verificar que los resultados son correctos        │
│     - Documentar cualquier issue encontrado             │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  5. ✓ CONFIRMAR Y MARCAR COMPLETADO                     │
│     - Actualizar TODO list (mark as completed)          │
│     - Hacer commit si es apropiado                      │
│     - Actualizar documentación del proyecto             │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  6. 🔁 REPETIR CON SIGUIENTE STEP                       │
│     - Revisar plan general                              │
│     - Seleccionar siguiente step                        │
│     - Volver al paso 1                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Estructura de un Plan de Implementación

### Template de Plan

```markdown
# [Nombre del Feature] Implementation Plan

## Overview
Brief description of what we're building and why.

---

## Priority 1: Critical - [Category Name]

### ✅ Step X: [Step Name]
**Status:** Pending / In Progress / Completed
**Description:** Clear description of what needs to be done
**Files to create/modify:**
- `path/to/file1.ts`
- `path/to/file2.tsx`

**Requirements:**
- Bullet point requirement 1
- Bullet point requirement 2
- Bullet point requirement 3

**Testing:**
- How to test this step
- Expected results
- Edge cases to verify

---

## Current Status
- **Completed Steps:** X/Y
- **In Progress:** Step name
- **Blocked:** None / Step name (reason)
- **Next Recommended:** Step name

---

## Notes
- Technical decisions made
- Dependencies
- Future considerations
```

---

## 🧪 Estrategias de Testing

### 1. **API Endpoints**

#### Usando cURL:
```bash
# Test GET endpoint
curl -X GET "http://localhost:PORT/api/resource" \
  -H "Authorization: Bearer TOKEN" \
  -w "\nHTTP Status: %{http_code}\n"

# Test POST endpoint
curl -X POST "http://localhost:PORT/api/resource" \
  -H "Content-Type: application/json" \
  -d '{"field": "value"}' \
  -w "\nHTTP Status: %{http_code}\n"

# Test with query parameters
curl -X GET "http://localhost:PORT/api/resource?status=active&limit=10" \
  -H "Authorization: Bearer TOKEN"
```

#### Usando Browser DevTools:
```javascript
// Test GET
fetch('/api/resource')
  .then(r => r.json())
  .then(data => console.log('✅ Data:', data))
  .catch(err => console.error('❌ Error:', err));

// Test POST
fetch('/api/resource', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ field: 'value' })
})
  .then(r => r.json())
  .then(data => console.log('✅ Created:', data));

// Test PATCH
fetch('/api/resource/123', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'updated' })
})
  .then(r => r.json())
  .then(data => console.log('✅ Updated:', data));

// Test DELETE
fetch('/api/resource/123', { method: 'DELETE' })
  .then(r => {
    if (r.ok) console.log('✅ Deleted');
    else console.error('❌ Error:', r.status);
  });
```

### 2. **Frontend Components**

#### Manual Testing:
```markdown
1. Navigate to [URL]
2. Click on [Element]
3. Verify that [Expected Behavior]
4. Test edge case: [Scenario]
5. Verify error handling: [Error Scenario]
```

#### Console Testing:
```javascript
// Test component state
console.log('Component state:', componentRef.current.state);

// Test function execution
myFunction(testData).then(result => {
  console.log('Result:', result);
});

// Verify localStorage/sessionStorage
console.log('Stored data:', localStorage.getItem('key'));
```

### 3. **Database Operations**

#### Using Prisma Studio:
```bash
npx prisma studio
```

#### Direct SQL queries:
```sql
-- Verify data was created
SELECT * FROM table_name WHERE id = 'xxx';

-- Check relationships
SELECT o.*, oi.*
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.id = 'xxx';
```

---

## ✅ Checklist para Cada Step

Antes de marcar un step como completado:

- [ ] Código implementado según especificaciones
- [ ] No hay errores de compilación/linting
- [ ] Pruebas manuales ejecutadas exitosamente
- [ ] Casos edge probados
- [ ] Manejo de errores verificado
- [ ] Validación de datos funcionando
- [ ] Documentación actualizada (si aplica)
- [ ] TODO list actualizado
- [ ] Usuario/Cliente ha confirmado funcionamiento

---

## 🎯 Tipos de Steps Comunes

### Backend Steps
1. **Create API Endpoint**
   - Define route and HTTP method
   - Implement authentication/authorization
   - Add request validation
   - Implement business logic
   - Return proper responses
   - Handle errors gracefully

2. **Database Schema Changes**
   - Update Prisma schema
   - Run migrations
   - Test data integrity
   - Update related queries

3. **Business Logic Implementation**
   - Implement core functionality
   - Add validation rules
   - Handle edge cases
   - Add error handling

### Frontend Steps
1. **Create UI Component**
   - Design component structure
   - Implement state management
   - Add event handlers
   - Style with CSS/Tailwind
   - Add accessibility features

2. **Form Implementation**
   - Create form schema (Zod)
   - Setup React Hook Form
   - Add validation
   - Implement submission
   - Handle errors
   - Show success feedback

3. **Data Fetching**
   - Create API hooks (SWR/React Query)
   - Implement loading states
   - Handle errors
   - Add retry logic
   - Cache management

---

## 🚦 Gestión de Errores Comunes

### Error en Compilación
```
STOP → No avanzar
1. Revisar error message
2. Corregir syntax/imports
3. Verificar tipos TypeScript
4. Re-test
```

### Test Falla
```
STOP → No avanzar
1. Verificar que test está correcto
2. Debuggear código implementado
3. Revisar logs del servidor
4. Verificar datos de prueba
5. Corregir y re-test
```

### Comportamiento Inesperado
```
STOP → No avanzar
1. Revisar especificaciones del step
2. Verificar implementación vs requirements
3. Debuggear con console.log / debugger
4. Verificar side effects
5. Corregir y re-test
```

---

## 📊 Tracking Progress

### TODO List Tool
```javascript
// Usar TodoWrite para trackear progreso
TodoWrite({
  todos: [
    {
      content: "Implement feature X",
      activeForm: "Implementing feature X",
      status: "in_progress"
    },
    {
      content: "Test feature X",
      activeForm: "Testing feature X",
      status: "pending"
    }
  ]
})
```

### Status Updates
```markdown
## Progress Report - [Date]

### Completed Today
- ✅ Step 1: Description
- ✅ Step 2: Description

### In Progress
- 🔄 Step 3: Description (80% done)

### Blocked
- ⏸️ Step 5: Waiting for decision on [topic]

### Next Steps
1. Complete Step 3
2. Begin Step 4
3. Review Step 6 requirements
```

---

## 🎓 Best Practices

### DO ✅
- ✅ Keep steps small and focused
- ✅ Write clear test instructions
- ✅ Document edge cases
- ✅ Test both success and error paths
- ✅ Update TODO list in real-time
- ✅ Commit after each completed step
- ✅ Write meaningful commit messages
- ✅ Ask for clarification when needed

### DON'T ❌
- ❌ Skip testing "because it looks right"
- ❌ Move to next step with failing tests
- ❌ Write huge steps that take hours
- ❌ Forget to update documentation
- ❌ Ignore error cases
- ❌ Assume requirements without confirming
- ❌ Rush through steps
- ❌ Leave TODOs unmarked

---

## 📚 Example: Complete Step Implementation

### Step Example: Create User Profile Endpoint

#### 1. Plan
```markdown
### Step 3: Create GET /api/profile endpoint
**Status:** Pending
**Description:** Create endpoint to fetch user profile data
**Files to create:**
- `src/app/api/profile/route.ts`

**Requirements:**
- Require authentication
- Return user data with avatar
- Include user preferences
- Return 401 if not authenticated
```

#### 2. Implementation
```typescript
// src/app/api/profile/route.ts
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const userId = req.headers.get('X-USER-ID')

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        preferences: true,
      }
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('[PROFILE_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
```

#### 3. Test Instructions
```javascript
// Test 1: Get authenticated user profile
fetch('/api/profile')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Profile:', data);
    console.log('Name:', data.name);
    console.log('Email:', data.email);
  });

// Test 2: Verify 401 without auth (using incognito/logout)
// Should return "Unauthorized"
```

#### 4. Expected Results
```json
{
  "id": "clxxx...",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://...",
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}
```

#### 5. Mark Complete
```markdown
### ✅ Step 3: Create GET /api/profile endpoint
**Status:** Completed ✅
**Tested:** 2025-10-25
**Results:** All tests passed
```

---

## 🔧 Tools & Setup

### Required Tools
- **API Testing:** cURL, Postman, or Browser DevTools
- **Database:** Prisma Studio, pgAdmin, or similar
- **Version Control:** Git
- **TODO Tracking:** TodoWrite tool or similar

### Browser DevTools Setup
```javascript
// Save this as a snippet in DevTools for quick testing
const testAPI = {
  get: (url) => fetch(url).then(r => r.json()).then(console.log),
  post: (url, data) => fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  }).then(r => r.json()).then(console.log),
  patch: (url, data) => fetch(url, {
    method: 'PATCH',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  }).then(r => r.json()).then(console.log),
  delete: (url) => fetch(url, {method: 'DELETE'}).then(r => console.log('Status:', r.status))
};

// Usage:
// testAPI.get('/api/orders')
// testAPI.post('/api/orders', {status: 'Processing'})
```

---

## 📈 Measuring Success

### Metrics to Track
- **Completion Rate:** Steps completed / Total steps
- **Bug Rate:** Bugs found in testing / Total steps
- **Rework Rate:** Steps that needed fixes / Completed steps
- **Time per Step:** Average time to complete a step

### Success Indicators
- ✅ All tests pass on first try
- ✅ No bugs found in completed steps
- ✅ Clear understanding of requirements
- ✅ Fast feedback loops (< 5 min per step)
- ✅ High confidence in code quality

---

## 🎯 Adaptations for Different Projects

### Small Projects (< 10 steps)
- Simpler TODO structure
- Can batch multiple micro-steps
- Less formal documentation

### Medium Projects (10-50 steps)
- Use the full methodology
- Group steps by feature/module
- Regular progress reviews

### Large Projects (50+ steps)
- Break into phases/milestones
- More detailed planning
- Automated testing integration
- Multiple developers coordination

---

## 💡 Tips & Tricks

1. **Start with the simplest step** - Build confidence and momentum
2. **Write tests before implementation** - Classic TDD when possible
3. **Use copy-paste carefully** - Adapt patterns, don't blindly copy
4. **Take breaks between steps** - Fresh eyes catch more issues
5. **Document "why" not just "what"** - Future you will thank you
6. **Celebrate small wins** - Each completed step is progress
7. **Don't skip error handling** - It's not optional
8. **Review completed steps** - Look back to improve forward

---

## 🚀 Getting Started Template

```markdown
# My Project Implementation Plan

## Step 1: Setup and Planning
- [ ] Create implementation plan document
- [ ] Set up development environment
- [ ] Configure testing tools
- [ ] Create initial TODO list

## Step 2: First Feature
- [ ] Implement core functionality
- [ ] Write test cases
- [ ] Execute tests
- [ ] Mark as complete

## Continue with remaining steps...
```

---

## 📞 Questions to Ask Before Each Step

1. **What exactly needs to be built?**
2. **What are the acceptance criteria?**
3. **How will I test this?**
4. **What can go wrong?**
5. **Are there dependencies on other steps?**
6. **Do I understand the requirements fully?**
7. **What's the expected outcome?**

---

## ✨ Conclusion

Esta metodología TDD Step-by-Step garantiza:

- 🎯 **Calidad:** Código probado en cada paso
- ⚡ **Velocidad:** Menos debugging, más construcción
- 📊 **Visibilidad:** Progreso claro y medible
- 🛡️ **Confianza:** Cada paso está validado
- 🎓 **Aprendizaje:** Documentación viviente del proceso

---

**Recuerda:** La clave del éxito es la disciplina de NO avanzar hasta que el step actual esté completamente probado y funcionando.

---

*Creado: 2025-10-25*
*Basado en: Orders Implementation Project*
*Metodología: TDD + Incremental + Interactive Development*

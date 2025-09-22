<script setup>
import { biseccion,newtonRaphson,reglaFalsa,secante } from './Funciones.js'
import { ref } from 'vue'

const limiteInferior = ref(0)
const limiteSuperior = ref(1)
const valorX0 = ref(0) 
const valorX1 = ref(1) 
const errorMax = ref(0.001)
const funcionSeleccionada = ref('ninguno')
const metodoSeleccionado = ref('ninguno')
const mostrarAlerta = ref(false)
const msjAlerta = ref('')
const resultados = ref(null)
const comparacion = ref(null)


//Funciones y sus derivadas
const funciones = {
  f: {
    f: x => (4*x**3) - (6*x**2) + (7*x) - 2.3,
    df: x => 12*x**2 - 12*x + 7,
    label: 'f(x) = 4x³ - 6x² + 7x - 2.3'
  },
  g: {
    f: x => (x**2) * Math.sqrt(Math.abs(Math.cos(x))) - 5,
    df: x => 2*x*Math.sqrt(Math.abs(Math.cos(x))) - (x**2 * Math.sin(x) * Math.sign(Math.cos(x))) / (2 * Math.sqrt(Math.abs(Math.cos(x)))),
    label: 'f(x) = x² * √|cos(x)| - 5'
  },
  h: {
    f: x => x**3 - 2*x**2 + x,
    df: x => 3*x**2 - 4*x + 1,
    label: 'f(x) = x³ - 2x² + x'
  },
  i: {
    f: x => 2*x**2 - 7*x + 5,
    df: x => 4*x - 7,
    label: 'f(x) = 2x² - 7x + 5'
  },
  j: {
    f: x => Math.log(x + 1) + 0.5*x - 1,
    df: x => 1/(x + 1) + 0.5,
    label: 'f(x) = ln(x + 1) + 0.5x - 1'
  },
  k: {
    f: x => Math.exp(x) - 3*x + 0.2*x**2,
    df: x => Math.exp(x) - 3 + 0.4*x,
    label: 'f(x) = eˣ - 3x + 0.2x²'
  },
  l: {
    f: x => Math.sin(x) - 0.5 + 0.1*x,
    df: x => Math.cos(x) + 0.1,
    label: 'f(x) = sin(x) - 0.5 + 0.1x'
  }
}

//Valores de cada seleccion de funcion
const opcionesFunciones = [
  { value: 'ninguno', label: 'Selecciona funcion' },
  { value: 'f', label: funciones.f.label },
  { value: 'g', label: funciones.g.label },
  { value: 'h', label: funciones.h.label },
  { value: 'i', label: funciones.i.label },
  { value: 'j', label: funciones.j.label },
  { value: 'k', label: funciones.k.label },
  { value: 'l', label: funciones.l.label }
]

//Valores de cada seleccion de metodo
const opcionesMetodos = [
  { value: 'ninguno', label: 'Selecciona metodo' },
  { value: 'biseccion', label: 'Metodo de Biseccion' },
  { value: 'reglaFalsa', label: 'Metodo de Regla Falsa' },
  { value: 'newtonRaphson', label: 'Metodo de Newton-Raphson' },
  { value: 'secante', label: 'Metodo de la Secante' }
]


const esMetodoIntervalo = ref(false)
const esNewtonRaphson = ref(false)
const esSecante = ref(false)

import { watch } from 'vue'
//Para mostrarinputs
watch(metodoSeleccionado, (nuevoMetodo) => {
  esMetodoIntervalo.value = ['biseccion', 'reglaFalsa'].includes(nuevoMetodo)
  esNewtonRaphson.value = nuevoMetodo === 'newtonRaphson'
  esSecante.value = nuevoMetodo === 'secante'

  resultados.value = null
  comparacion.value = null
})

function bloquearTeclas(event) {
  if(["e", "E", "+"].includes(event.key)) {
    event.preventDefault()
    return
  }
}

function validarInputs() {
  if (errorMax.value === '' || funcionSeleccionada.value === 'ninguno' || metodoSeleccionado.value === 'ninguno') {
    return false
  }
  
  if (esMetodoIntervalo.value && (limiteInferior.value === '' || limiteSuperior.value === '')) {
    return false
  }
  
  if (esNewtonRaphson.value && valorX0.value === '') {
    return false
  }
  
  if (esSecante.value && (valorX0.value === '' || valorX1.value === '')) {
    return false
  }
  
  return true
}

function cerrarAlerta() {
  mostrarAlerta.value = false
}

// Encabezados de columas de cada metodo
function obtenerColumnas() {
  switch(metodoSeleccionado.value) {
    case 'biseccion':
      return ['xi', 'xf', 'xr', 'f(xi)', 'f(xr)', 'f(xi)*f(xr)', 'ea(%)']
    case 'reglaFalsa':
      return ['xi', 'xf', 'f(xi)', 'f(xf)', 'xr', 'f(xr)', 'f(xi)*f(xr)', 'ea(%)']
    case 'newtonRaphson':
      return ['xi', 'f(xi)', "f'(xi)", 'ea(%)']
    case 'secante':
      return ['x1', 'x2', 'f(x1)', 'f(x2)', 'xr', 'ea(%)']
    default:
      return []
  }
}

//Para obtener las raices
function obtenerRaices() {
  mostrarAlerta.value = false
  if (!validarInputs()) {
    msjAlerta.value = 'Llena todos los campos correctamente'
    mostrarAlerta.value = true
    return
  }

  const funcionObj = funciones[funcionSeleccionada.value]
  if (!funcionObj) {
    msjAlerta.value = 'Funcion no encontrada'
    mostrarAlerta.value = true
    return
  }
  if (esMetodoIntervalo.value) {
    const fa = funcionObj.f(limiteInferior.value)
    const fb = funcionObj.f(limiteSuperior.value)
    
    if (fa * fb > 0) {
      msjAlerta.value = 'Los valores de la funcion en los limites deben tener signos opuestos para garantizar una raiz'
      mostrarAlerta.value = true
      return
    }
  }

  try {
    let resultado
    const metodosLabels = {
      biseccion: 'Biseccion',
      reglaFalsa: 'Regla Falsa',
      newtonRaphson: 'Newton-Raphson',
      secante: 'Secante'
    }

    switch(metodoSeleccionado.value) {
      case 'biseccion':
        resultado = biseccion(funcionObj.f, limiteInferior.value, limiteSuperior.value, errorMax.value)
        break
      case 'reglaFalsa':
        resultado = reglaFalsa(funcionObj.f, limiteInferior.value, limiteSuperior.value, errorMax.value)
        break
      case 'newtonRaphson':
        resultado = newtonRaphson(funcionObj.f, funcionObj.df, valorX0.value, errorMax.value)
        break
      case 'secante':
        resultado = secante(funcionObj.f, valorX0.value, valorX1.value, errorMax.value)
        break
      default:
        throw new Error('No se encontro metodo')
    }
    
    if (resultado.mensaje) {
      msjAlerta.value = resultado.mensaje
      mostrarAlerta.value = true
      return
    }

    resultados.value = {
      ...resultado,
      metodo: metodosLabels[metodoSeleccionado.value],
      funcion: funcionObj.label,
      tipoMetodo: metodoSeleccionado.value
    }
    
  } catch (error) {
    msjAlerta.value = 'Error al calcular la raiz: ' + error.message
    mostrarAlerta.value = true
  }
}

//Compara todos los metodos
function compararMetodos() {
  mostrarAlerta.value = false
  
  const funcionObj = funciones.f
  const xi = 0
  const xf = 1
  const x0 = 0.5
  const x1 = 0.7
  const eamax = 0.001
  
  const resultados = []
  
  const fa = funcionObj.f(xi)
  const fb = funcionObj.f(xf)
  
  try {
    // Biseccion
    if (fa * fb <= 0) {
      const resBiseccion = biseccion(funcionObj.f, xi, xf, eamax)
      if (!resBiseccion.mensaje) {
        resultados.push({
          metodo: 'Biseccion',
          iteraciones: resBiseccion.iteraciones,
          raiz: resBiseccion.raiz,
          f_raiz: resBiseccion.f_raiz,
          error: resBiseccion.error
        })
      }
    }
    
    // Regla Falsa
    if (fa * fb <= 0) {
      const resReglaFalsa = reglaFalsa(funcionObj.f, xi, xf, eamax)
      if (!resReglaFalsa.mensaje) {
        resultados.push({
          metodo: 'Regla Falsa',
          iteraciones: resReglaFalsa.iteraciones,
          raiz: resReglaFalsa.raiz,
          f_raiz: resReglaFalsa.f_raiz,
          error: resReglaFalsa.error
        })
      }
    }
    
    // Newton
    const resNewton = newtonRaphson(funcionObj.f, funcionObj.df, x0, eamax)
    if (!resNewton.mensaje) {
      resultados.push({
        metodo: 'Newton-Raphson',
        iteraciones: resNewton.iteraciones,
        raiz: resNewton.raiz,
        f_raiz: resNewton.f_raiz,
        error: resNewton.error
      })
    }
    
    // Secante
    const resSecante = secante(funcionObj.f, x0, x1, eamax)
    if (!resSecante.mensaje) {
      resultados.push({
        metodo: 'Secante',
        iteraciones: resSecante.iteraciones,
        raiz: resSecante.raiz,
        f_raiz: resSecante.f_raiz,
        error: resSecante.error
      })
    }
    
    comparacion.value = {
      funcion: funcionObj.label,
      metodos: resultados
    }
    
  } catch (error) {
    msjAlerta.value = 'Error en la comparacion: ' + error.message
    mostrarAlerta.value = true
  }
}
</script>

<template>
  <div class="container">
    <h1>Obtener Raices de Funciones</h1>
    <p>Ingresa los parametros, selecciona la funcion, el metodo numerico y el error maximo para encontrar raices.</p>
    
    <!-- Alerta -->
    <div v-if="mostrarAlerta" class="alerta">
      <div class="alerta-contenido">
        <span class="icono-alerta">⚠️</span>
        <span class="mensaje-alerta">{{ msjAlerta }}</span>
        <button class="boton-cerrar" @click="cerrarAlerta">×</button>
      </div>
    </div>

    <div class="inputs">
      <div class="selectores">
        <label class="selector-funcion">
          Funcion a analizar
          <select v-model="funcionSeleccionada" class="select-funcion">
            <option v-for="opcion in opcionesFunciones" :key="opcion.value" :value="opcion.value">
              {{ opcion.label }}
            </option>
          </select>
        </label>
        
        <label class="selector-metodo">
          Metodo numerico
          <select v-model="metodoSeleccionado" class="select-funcion">
            <option v-for="opcion in opcionesMetodos" :key="opcion.value" :value="opcion.value">
              {{ opcion.label }}
            </option>
          </select>
        </label>
      </div>
      
      <div class="inputs-numericos">
        <!-- Regla y biseccion -->
        <template v-if="esMetodoIntervalo">
          <label>
            Valor de Xi
            <input type="number" v-model.number="limiteInferior" @keydown="bloquearTeclas" step="0.01" />
          </label>
          
          <label>
            Valor de Xf
            <input type="number" v-model.number="limiteSuperior" @keydown="bloquearTeclas" step="0.01" />
          </label>
        </template>
        
        <!--Newton -->
        <template v-if="esNewtonRaphson">
          <label>
            Valor inicial X₀
            <input type="number" v-model.number="valorX0" @keydown="bloquearTeclas" step="0.01" />
          </label>
        </template>
        
        <!-- Secante -->
        <template v-if="esSecante">
          <label>
            Valor X₀
            <input type="number" v-model.number="valorX0" @keydown="bloquearTeclas" step="0.01" />
          </label>
          
          <label>
            Valor X₁
            <input type="number" v-model.number="valorX1" @keydown="bloquearTeclas" step="0.01" />
          </label>
        </template>
        
        <label>
          Error maximo
          <input type="number" v-model.number="errorMax" @keydown="bloquearTeclas" min="0.0001" step="0.0001" />
        </label>
      </div>
    </div>
    
    <button @click="obtenerRaices" class="boton-principal">
      Calcular Raiz
    </button>
    <button @click="compararMetodos" class="boton-comparacion">
      Comparar Todos los Metodos 
    </button>
    
    <!-- Resultados -->
    <div v-if="resultados" class="resultados-wrapper">
      <div class="resultados-header">
        <h2>Resultados del Analisis</h2>
        <div class="metodo-usado">
          <span class="metodo-badge">{{ resultados.metodo }}</span>
        </div>
      </div>
      
      <div class="stats-grid">
        <div class="stat-item raiz">
          <span class="stat-icon"></span>
          <span class="stat-label">Raiz encontrada</span>
          <span class="stat-value">{{ resultados.raiz }}</span>
        </div>
        
        <div class="stat-item funcion">
          <span class="stat-icon"></span>
          <span class="stat-label">f(raiz)</span>
          <span class="stat-value">{{ resultados.f_raiz }}</span>
        </div>
        
        <div class="stat-item error">
          <span class="stat-icon"></span>
          <span class="stat-label">Error final (%)</span>
          <span class="stat-value">{{ resultados.error }}</span>
        </div>
        
        <div class="stat-item iteraciones">
          <span class="stat-icon"></span>
          <span class="stat-label">Iteraciones</span>
          <span class="stat-value">{{ resultados.iteraciones }}</span>
        </div>
      </div>
    </div>
    
    <!-- Tabla -->
    <div v-if="resultados && resultados.tabla" class="tabla-iteraciones">
      <h3>Tabla de Iteraciones</h3>
      <div class="tabla-container">
        <table>
          <thead>
            <tr>
              <th v-for="columna in obtenerColumnas()" :key="columna">{{ columna }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(fila, index) in resultados.tabla" :key="index">
              <!-- Tabla biseccion -->
              <template v-if="resultados.tipoMetodo === 'biseccion'">
                <td>{{ fila.xi }}</td>
                <td>{{ fila.xf }}</td>
                <td>{{ fila.xr }}</td>
                <td>{{ fila.fxi }}</td>
                <td>{{ fila.fxr }}</td>
                <td>{{ fila.prod }}</td>
                <td>{{ fila.ea }}</td>
              </template>
              
              <!-- Tabla regla  -->
              <template v-else-if="resultados.tipoMetodo === 'reglaFalsa'">
                <td>{{ fila.xi }}</td>
                <td>{{ fila.xf }}</td>
                <td>{{ fila.fxi }}</td>
                <td>{{ fila.fxf }}</td>
                <td>{{ fila.xr }}</td>
                <td>{{ fila.fxr }}</td>
                <td>{{ fila.prod }}</td>
                <td>{{ fila.ea }}</td>
              </template>
              
              <!-- Tabla newton -->
              <template v-else-if="resultados.tipoMetodo === 'newtonRaphson'">
                <td>{{ fila.xi }}</td>
                <td>{{ fila.fxi }}</td>
                <td>{{ fila.dfxi }}</td>
                <td>{{ fila.ea }}</td>
              </template>
              
              <!-- Tabla secante -->
              <template v-else-if="resultados.tipoMetodo === 'secante'">
                <td>{{ fila.xi }}</td>
                <td>{{ fila.xi1 }}</td>
                <td>{{ fila.fxi }}</td>
                <td>{{ fila.fxi1 }}</td>
                <td>{{ fila.xr }}</td>
                <td>{{ fila.ea }}</td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- Tabla comparacion -->
    <div v-if="comparacion" class="tabla-iteraciones">
      <h3>Comparacion de Metodos</h3>
      <p class="funcion-comparacion">Funcion: {{ comparacion.funcion }}</p>
      <div class="tabla-container">
        <table>
          <thead>
            <tr>
              <th>Metodo</th>
              <th>Iteraciones</th>
              <th>Raiz</th>
              <th>Y(raiz)</th>
              <th>Error aprox</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="metodo in comparacion.metodos" :key="metodo.metodo">
              <td><strong>{{ metodo.metodo }}</strong></td>
              <td>{{ metodo.iteraciones }}</td>
              <td>{{ metodo.raiz }}</td>
              <td>{{ metodo.f_raiz }}</td>
              <td>{{ metodo.error }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 900px;
  margin: auto;
  padding: 2rem;
  background: #242424;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.6);
  font-family: system-ui, sans-serif;
  color: #f9fafb;
}

h1 {
  text-align: center;
  color: #60a5fa;
  margin-bottom: 1rem;
  font-size: 1.8rem;
}

p {
  color: #d1d5db;
  text-align: center;
  margin-bottom: 1.5rem;
}

/* Estilos para la alerta */
.alerta {
  margin-bottom: 1rem;
  animation: slideDown 0.3s ease-out;
}

.alerta-contenido {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #7c2d12;
  border: 1px solid #dc2626;
  border-radius: 0.5rem;
  color: #fef2f2;
  position: relative;
}

.icono-alerta {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.mensaje-alerta {
  flex: 1;
  font-weight: 500;
}

.boton-cerrar {
  background: none;
  border: none;
  color: #fef2f2;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  margin: 0;
  margin-left: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.boton-cerrar:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.inputs {
  margin-bottom: 1.5rem;
}

.selectores {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.selector-funcion,
.selector-metodo {
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
  color: #e5e7eb;
  flex: 1;
  min-width: 250px;
}

.inputs-numericos {
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}

label {
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
  color: #e5e7eb;
  flex: 1;
  min-width: 120px;
}

input, .select-funcion {
  padding: 0.5rem;
  border: 1px solid #444;
  border-radius: 0.5rem;
  margin-top: 0.3rem;
  background: #1f1f1f;
  color: #f9fafb;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus, .select-funcion:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
}

.select-funcion {
  cursor: pointer;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

.boton-principal {
  display: block;
  margin: 1.5rem auto;
  padding: 0.8rem 2rem;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.boton-principal:hover {
  background: linear-gradient(135deg, #1d4ed8, #1e40af);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
}

.boton-principal:active {
  transform: translateY(0);
}

/* Estilos para los resultados */
.resultados-wrapper {
  margin-top: 2rem;
  background: #1f1f1f;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid #333;
}

.resultados-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.resultados-header h2 {
  color: #60a5fa;
  margin: 0;
  font-size: 1.4rem;
}

.metodo-usado {
  display: flex;
  align-items: center;
}

.metodo-badge {
  background: linear-gradient(135deg, #059669, #047857);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border-radius: 0.75rem;
  border: 2px solid;
  text-align: center;
  transition: transform 0.2s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-item.raiz {
  background: rgba(34, 197, 94, 0.1);
  border-color: #22c55e;
}

.stat-item.funcion {
  background: rgba(168, 85, 247, 0.1);
  border-color: #a855f7;
}

.stat-item.error {
  background: rgba(249, 115, 22, 0.1);
  border-color: #f97316;
}

.stat-item.iteraciones {
  background: rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
}

.stat-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #d1d5db;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.raiz .stat-value { color: #22c55e; }
.funcion .stat-value { color: #a855f7; }
.error .stat-value { color: #f97316; }
.iteraciones .stat-value { color: #3b82f6; }

/* Estilos para la tabla */
.tabla-iteraciones {
  margin-top: 2rem;
  background: #1f1f1f;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid #333;
}

.tabla-iteraciones h3 {
  color: #60a5fa;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  text-align: center;
}

.tabla-container {
  overflow-x: auto;
  border-radius: 0.75rem;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

.tabla-iteraciones table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  background: #2d2d2d;
  border-radius: 0.75rem;
  overflow: hidden;
  min-width: 600px;
}

.tabla-iteraciones th {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  padding: 0.75rem 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #1e40af;
}

.tabla-iteraciones td {
  padding: 0.6rem 0.5rem;
  border-bottom: 1px solid #444;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
}

.tabla-iteraciones tr:nth-child(even) {
  background: #333;
}

.tabla-iteraciones tr:hover {
  background: rgba(96, 165, 250, 0.1);
  transition: background-color 0.2s ease;
}

.tabla-iteraciones tr:last-child td {
  border-bottom: none;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
    max-width: 100%;
  }
  
  .selectores {
    flex-direction: column;
  }
  
  .selector-funcion,
  .selector-metodo {
    min-width: auto;
  }
  
  .inputs-numericos {
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .resultados-header {
    flex-direction: column;
    text-align: center;
  }
  
  .tabla-container {
    font-size: 0.8rem;
  }
  
  .tabla-iteraciones th,
  .tabla-iteraciones td {
    padding: 0.4rem 0.3rem;
  }
}

/* Animaciones */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.resultados-wrapper {
  animation: fadeIn 0.5s ease-out;
}

.tabla-iteraciones {
  animation: fadeIn 0.7s ease-out;
}
.boton-comparacion {
  display: block;
  margin: 1rem auto;
  padding: 0.8rem 2rem;
  background: linear-gradient(135deg, #059669, #047857);
  color: white;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.boton-comparacion:hover {
  background: linear-gradient(135deg, #047857, #065f46);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.4);
}

.tabla-comparacion {
  margin-top: 2rem;
  background: #1f1f1f;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid #333;
  animation: fadeIn 0.7s ease-out;
}

.tabla-comparacion h3 {
  color: #10b981;
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
  text-align: center;
}

.funcion-comparacion {
  color: #d1d5db;
  text-align: center;
  margin-bottom: 1rem;
  font-style: italic;
}
</style>
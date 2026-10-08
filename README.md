# 🚕 Gestor de Licencias de Taxi (App + Web en Expo)

Aplicación multiplataforma (Móvil iOS/Android y Web) desarrollada en **Expo + React Native + TypeScript** diseñada para la gestión comercial y cruces automáticos de compra/venta de licencias de taxi.

---

## 🚀 Características Principales

### 1. 🎯 Motor Inteligente de Matching y Avisos (Comprador ↔ Vendedor)
- **Cruce Automático**: En cuanto introduces un comprador o vendedor, el motor analiza compatibilidades en tiempo real.
- **Puntuación de Afinidad (Score 0 - 100%)**:
  - **Día de Libranza**: Coincidencia exacta o si el comprador busca cualquier libranza.
  - **Precio vs Presupuesto**: Compara si entra en el presupuesto o si supera ligeramente pero el vendedor tiene marcado **"Precio Negociable"** (muestra alerta de margen de negociación).
  - **Vehículo**: Compara si el comprador busca con coche, solo licencia o es indiferente, con el vehículo del vendedor (modelo, año, km, cargas).
  - **Cargas / Préstamo**: Detecta licencias libres de cargas o con préstamo existente asumible.
  - **Bonus de Señal Inmediata**: Detecta compradores calientes listos para dar señal de inmediato (`🔥 SEÑALIZA YA`).
  - **Condición de Venta**: Notifica si la venta está condicionada a fecha de jubilación u otras condiciones.

### 2. 📋 Asistente Comercial & Estrategia de Gestorías
- **Estrategia de 2 Gestorías**:
  1. **Opción 1 (Recomendada / TOP)**: *Gestoría Asesoría Integral del Taxi* (hacen el 100% del papeleo oficial y tramitan la **ayuda/subvención a fondo perdido de hasta 6.000 €**).
  2. **Opción 2 (Disuasoria)**: *Gestoría en El Casar de Talamanca* (opción neutra y a desmano para dar la alternativa y que elijan la primera con naturalidad sin parecer comercial agresivo).
- **Guión Telefónico Integrado**: Textos listos para leer en directo durante la llamada o copiar con un clic.
- **Speech para Bolsa de Espera**: Guión de fidelización cuando no le interesa ninguna licencia en ese instante para mantenerlo en cartera e invitarle a llamar para cualquier consulta.

### 3. 🚕 Ficha Completa del Vendedor (Licencia + Coche)
- Día de libranza (Lunes a Domingo con badges de color específicos).
- Carga de la licencia: Libre / Con préstamo (importe, entidad) / Otra.
- Venta con vehículo: Modelo, Año de matriculación, Kilómetros, Carga del coche.
- Precio y switch "¿Es Negociable?".
- Particular o Intermediario.
- Venta condicionada a fecha de jubilación o fecha de entrega.
- Contador de compradores en espera compatibles.

### 4. 👥 Ficha Completa del Comprador
- Particular o Intermediario.
- Libranza buscada (Día concreto o Cualquiera).
- Presupuesto máximo que puede/quiere pagar.
- ¿Puede señalizar YA?
- Preferencia de coche (Solo licencia / Con coche / Indiferente).
- Acepta licencia con préstamo existente o solo libre.
- Situación de gestoría.
- **Buscador en tiempo real de licencias**: Mientras metes los datos, te muestra qué licencias le encajan en directo para ofrecérselas por teléfono sobre la marcha.

### 5. 💾 Persistencia y Copias de Seguridad
- Datos persistidos localmente con `AsyncStorage` (compatible con Web y Móvil).
- Exportación e importación completa en formato JSON para respaldar tus contactos y licencias.
- Datos de prueba/demo incluidos para demostraciones inmediatas.

---

## 🛠️ Comandos de Ejecución

```bash
# Arrancar en Web (Navegador)
npm run web
# o bien:
npx expo start --web

# Arrancar para Móvil (Expo Go o emulador)
npm start
# o bien:
npx expo start

# Verificación de tipos TypeScript
npx tsc --noEmit

# Diagnóstico de dependencias de Expo
npx expo-doctor
```

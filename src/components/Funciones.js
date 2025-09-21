export let valoresTabla = [];

export function biseccion(f, xi, xf, eamax) {
    valoresTabla.length = 0; 
    let fxi = f(xi);
    let fxf = f(xf);
    let xr, xrAnterior, fxr, error;
    let iteraciones = 0;
    
    if (fxi * fxf > 0) {
        return { mensaje: "Intervalo invalido: no hay raiz en este rango." }
    }
    
    while (true) {
        xrAnterior = xr;
        xr = (xi + xf) / 2;
        fxr = f(xr);
        let producto = fxi * fxr;
        iteraciones++;

        if (iteraciones > 1) {
            error = Math.abs((xr - xrAnterior) / xr) * 100;
        } else {
            error = 100;
        }

        valoresTabla.push({
            xi: parseFloat(xi.toFixed(6)),
            xf: parseFloat(xf.toFixed(6)),
            fxi: parseFloat(fxi.toFixed(6)),
            fxf: parseFloat(fxf.toFixed(6)),
            xr: parseFloat(xr.toFixed(6)),
            fxr: parseFloat(fxr.toFixed(6)),
            prod: parseFloat(producto.toFixed(6)),
            ea: parseFloat(error.toFixed(6))
        });

        if (error < eamax) {
            return {
                raiz: parseFloat(xr.toFixed(6)),
                f_raiz: parseFloat(fxr.toFixed(6)),
                error: parseFloat(error.toFixed(6)),
                iteraciones: iteraciones,
                tabla: valoresTabla
            };
        }
        
        if (iteraciones >= 100) {
            return {
                mensaje: "No se encontro la raiz en 100 iteraciones."
            };
        }

        if (producto < 0) {
            xf = xr;
            fxf = fxr;
        } else {
            xi = xr;
            fxi = fxr;
        }
    }
}

export function reglaFalsa(f, xi, xf, eamax) {
    valoresTabla.length = 0;
    
    let fxi = f(xi);
    let fxf = f(xf);
    let xr, xrAnterior, fxr, error;
    let iteraciones = 0;
    
    if (fxi * fxf > 0) {
        return { mensaje: "Intervalo invalido: no hay raiz en este rango." }
    }

    while (true) {
        xrAnterior = xr;
        xr = (xi * fxf - xf * fxi) / (fxf - fxi);
        fxr = f(xr);
        let producto = fxi * fxr;
        iteraciones++;

        if (iteraciones > 1) {
            error = Math.abs((xr - xrAnterior) / xr) * 100;
        } else {
            error = 100; 
        }

        valoresTabla.push({
            xi: parseFloat(xi.toFixed(6)),
            xf: parseFloat(xf.toFixed(6)),
            fxi: parseFloat(fxi.toFixed(6)),
            fxf: parseFloat(fxf.toFixed(6)),
            xr: parseFloat(xr.toFixed(6)),
            fxr: parseFloat(fxr.toFixed(6)),
            prod: parseFloat(producto.toFixed(6)),
            ea: parseFloat(error.toFixed(6))
        });

        if (error < eamax) {
            return {
                raiz: parseFloat(xr.toFixed(6)),
                f_raiz: parseFloat(fxr.toFixed(6)),
                error: parseFloat(error.toFixed(6)),
                iteraciones: iteraciones,
                tabla: valoresTabla
            };
        }
 
        if (iteraciones >= 100) {
            return {
                mensaje: "No se encontro la raiz en 100 iteraciones."
            };
        }

        if (producto < 0) {
            xf = xr;
            fxf = fxr;
        } else {
            xi = xr;
            fxi = fxr;
        }
    }
}

export function newtonRaphson(f, df, xi, eamax) {
    // Asegurarnos que existe la variable global valoresTabla (si no, la creamos)
    if (typeof valoresTabla === 'undefined') valoresTabla = [];
    valoresTabla.length = 0;

    let fxi = f(xi);
    let dfxi = df(xi);

    if (dfxi === 0) {
        return { mensaje: "La derivada es cero en el punto inicial." };
    }

    // Empujamos la fila inicial (x0) con EA = 100 (convención)
    valoresTabla.push({
        xi: parseFloat(xi.toFixed(6)),
        fxi: parseFloat(fxi.toFixed(6)),
        dfxi: parseFloat(dfxi.toFixed(6)),
        ea: 100
    });

    let iteraciones = 0;

    while (true) {
        const xr = xi - (fxi / dfxi);
        const fxr = f(xr);
        const dfxr = df(xr);
        iteraciones++;

        // Calcular EA de forma segura (evitar división por cero)
        let error;
        if (xr === 0) {
            // si xi también fue 0, por convención ponemos 100%
            error = (xi === 0) ? 100 : Math.abs(xr - xi) * 100;
        } else {
            error = Math.abs((xr - xi) / xr) * 100;
        }

        // Empujamos la fila DEL NUEVO punto xr (sin desfasar)
        valoresTabla.push({
            xi: parseFloat(xr.toFixed(6)),
            fxi: parseFloat(fxr.toFixed(6)),
            dfxi: parseFloat(dfxr.toFixed(6)),
            ea: parseFloat(error.toFixed(6))
        });

        // Criterio de paro (eamax en porcentaje)
        if (error < eamax) {
            return {
                raiz: parseFloat(xr.toFixed(6)),
                f_raiz: parseFloat(fxr.toFixed(6)),
                error: parseFloat(error.toFixed(6)),
                iteraciones: iteraciones,
                tabla: valoresTabla
            };
        }

        if (iteraciones >= 100) {
            return { mensaje: "No se encontro la raiz en 100 iteraciones.", tabla: valoresTabla };
        }

        if (dfxr === 0) {
            return { mensaje: "La derivada es cero en una iteracion.", tabla: valoresTabla };
        }

        // Actualizar para la siguiente iteración
        xi = xr;
        fxi = fxr;
        dfxi = dfxr;
    }
}


export function secante(f, xi, xi1, eamax) {
    valoresTabla.length = 0;
    let fxi = f(xi);
    let fxi1 = f(xi1);
    let xr, fxr, error;
    let iteraciones = 0;
    
    if (fxi === fxi1) {
        return { mensaje: "Los valores iniciales producen division por cero." }
    }
    
    while (true) {
        xr = xi1 - (fxi1 * (xi1 - xi)) / (fxi1 - fxi);
        fxr = f(xr);
        iteraciones++;
        
        if (iteraciones > 1) {
            error = Math.abs((xr - xi1) / xr) * 100;
        } else {
            error = 100;
        }
        
        valoresTabla.push({
            xi: parseFloat(xi.toFixed(6)),
            xi1: parseFloat(xi1.toFixed(6)),
            fxi: parseFloat(fxi.toFixed(6)),
            fxi1: parseFloat(fxi1.toFixed(6)),
            xr: parseFloat(xr.toFixed(6)),
            fxr: parseFloat(fxr.toFixed(6)),
            ea: parseFloat(error.toFixed(6))
        });
        
        if (error < eamax) {
            return {
                raiz: parseFloat(xr.toFixed(6)),
                f_raiz: parseFloat(fxr.toFixed(6)),
                error: parseFloat(error.toFixed(6)),
                iteraciones: iteraciones,
                tabla: valoresTabla
            };
        }   
        
        if (iteraciones >= 100) {
            return {
                mensaje: "No se encontro la raiz en 100 iteraciones."
            };
        }
        
        if (fxi1 === fxi) {
            return { mensaje: "Division por cero en una iteracion." }
        }
        
        xi = xi1;
        fxi = fxi1;
        xi1 = xr;
        fxi1 = fxr;
    }
}
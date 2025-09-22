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
    valoresTabla.length = 0;

    let fxi = f(xi);
    let dfxi = df(xi);

    if (dfxi === 0) {
        return { mensaje: "La derivada es cero en el punto inicial." };
    }

    // Registro la fila inicial (ea = 100 por convención)
    valoresTabla.push({
        xi: parseFloat(xi.toFixed(6)),
        fxi: parseFloat(fxi.toFixed(6)),
        dfxi: parseFloat(dfxi.toFixed(6)),
        ea: 100
    });

    let iteraciones = 0;

    while (iteraciones < 100) {
        // calculo la siguiente aproximación
        const xi2 = xi - (fxi / dfxi);
        const fxi2 = f(xi2);
        const dfxi2 = df(xi2);

        iteraciones++;

        // calculo error relativo con protección contra división por cero
        const denom = Math.abs(xi2) > 1e-12 ? xi2 : xi; // si xi2 == 0 usa xi
        const error = (iteraciones === 1) ? 100 : Math.abs((xi2 - xi) / denom) * 100;

        // ahora guardo la fila correspondiente a la nueva aproximación xi2
        valoresTabla.push({
            xi: parseFloat(xi2.toFixed(6)),
            fxi: parseFloat(fxi2.toFixed(6)),
            dfxi: parseFloat(dfxi2.toFixed(6)),
            ea: parseFloat(error.toFixed(6))
        });

        // criterio de parada
        if (error < eamax) {
            return {
                raiz: parseFloat(xi2.toFixed(6)),
                f_raiz: parseFloat(fxi2.toFixed(6)),
                error: parseFloat(error.toFixed(6)),
                iteraciones: iteraciones + 1,
                tabla: valoresTabla
            };
        }

        // preparo la siguiente iteración
        xi = xi2;
        fxi = fxi2;
        dfxi = dfxi2;

        if (dfxi === 0) {
            return { mensaje: "La derivada es cero en una iteracion." };
        }
    }

    return { mensaje: "No se encontro la raiz en 100 iteraciones." };
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
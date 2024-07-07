const montoCLP = document.querySelector("#montoCLP")
const btn = document.querySelector("#convertir")
const resultado = document.querySelector("#resultado")
const fechaTC = document.querySelector("#fechaTC")
const moneda = document.querySelector("#moneda")

//funcion para buscar los últimos 10 días de la moneda
async function getUltimosDiasMoneda() {
    const respuesta = await fetch(`https://mindicador.cl/api/${moneda.value}`)
    const data = await respuesta.json();
    let dataUltimosDias = data.serie.slice(0,10)
    let dataUltimosDiasReverse = dataUltimosDias.reverse()

    const fechasGrafico = dataUltimosDiasReverse.map((data) =>{
        const fecha = new Date(data.fecha);
        const formatoFecha = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const fechaCorregida = formatoFecha.format(fecha);
        return fechaCorregida
    });

    const valoresGrafico = dataUltimosDiasReverse.map((data) =>{
        return data.valor
    });
    
    const datasets = [{
        label: `${moneda.value} observado`,
        borderColor: "red",
        data: valoresGrafico
    }];

    return {fechasGrafico, datasets};
}

//funcion para renderizar gráfico
async function renderGrafico(){
    const seccionGrafico = document.getElementById("chart-container");
    seccionGrafico.innerHTML = ``;
    seccionGrafico.innerHTML = `<canvas id="grafico"></canvas>`;
    const myChart = document.getElementById("grafico");

    const data = await getUltimosDiasMoneda();
    const config = {
        type: "line",
        data: {
            labels: data.fechasGrafico,
            datasets: data.datasets
        },
        options: {
            plugins:{
                title:{
                    display: true,
                    text: 'Observado últimos 10 días',
                }
            }
        }
    };
    myChart.style.backgroundColor = "white";
    
    let graficoMonedas = new Chart(myChart, config);
    graficoMonedas.update('active')
}

const indicadores = async() =>{
    try{
        const respuesta = await fetch(`https://mindicador.cl/api/`);
        const data = await respuesta.json();

        let monto_a_convertir = montoCLP.value
        let tipoCambio = data[moneda.value].valor;
        let montoConvertido = (monto_a_convertir/tipoCambio).toFixed(2);
        
        //Fecha Actualizacion
        let fechaActualizacion = new Date(data.fecha);
        
        let diaFecha = fechaActualizacion.getDate();
        let mesFecha = fechaActualizacion.getMonth()+1;
        let anioFecha = fechaActualizacion.getFullYear();

        //Resultado
        conversion = ``;
        conversion += `Resultado: $${montoConvertido} ${moneda.value}`;

        resultado.innerHTML = conversion;
        fechaTC.innerHTML = `Fecha Actualización: ${diaFecha}/${mesFecha}/${anioFecha}`;
        
        //Gráfico
        renderGrafico()
    } catch(error){
        errorDOM = ``
        errorDOM += `Error - Intente en unos minutos`
        resultado.innerHTML = errorDOM;
        alert("Falló la API. Intente más tarde")
    }
}

btn.addEventListener("click", () =>  {
    indicadores()
})
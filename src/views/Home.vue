<template>
  <v-container>
    <v-layout wrap>
      <v-flex xs12 sm12 md12 lg12 xl12>
        <div class="home">
          <canvas id="myChart"></canvas>
        </div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import axios from "axios";
import Chart from "chart.js";
export default {
  data() {
    return {
      mesesValores: null,
      nombreMeses: [],
      totalMeses: [],
    };
  },
  methods: {
    loadMasVendidos() {
      let me = this;
      let mesNombre = "";

      me.mesesValores.map(function(val) {
        switch (parseInt(val.etiqueta)) {
          case 1:
            mesNombre = "Enero";
            break;
          case 2:
            mesNombre = "Febrero";
            break;
          case 3:
            mesNombre = "Marzo";
            break;
          case 4:
            mesNombre = "Abril";
            break;
          case 5:
            mesNombre = "Mayo";
            break;
          case 6:
            mesNombre = "Junio";
            break;
          case 7:
            mesNombre = "Julio";
            break;
          case 8:
            mesNombre = "Agosto";
            break;
          case 9:
            mesNombre = "Septiembre";
            break;
          case 10:
            mesNombre = "Octubre";
            break;
          case 11:
            mesNombre = "Noviembre";
            break;
          case 12:
            mesNombre = "Diciembre";
            break;
          default:
            mesNombre = "NULL";
            break;
        }
        me.nombreMeses.push(mesNombre);
        me.totalMeses.push(val.valor);
      });

      var ctx = document.getElementById("myChart").getContext("2d");
      var myChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: me.nombreMeses,
          datasets: [
            {
              label: "Ventas de los últimos 12 meses",
              data: me.totalMeses,
              backgroundColor: [
                "rgba(255, 99, 132, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(255, 206, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
                "rgba(153, 102, 255, 0.2)",
                "rgba(255, 159, 64, 0.2)",
                "rgba(255, 99, 132, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(255, 206, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
                "rgba(153, 102, 255, 0.2)",
                "rgba(255, 159, 64, 0.2)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                },
              },
            ],
          },
        },
      });
    },
    getMasVendidos() {
      let me = this;
      let header = { Authorization: "Bearer " + this.$store.state.token };
      let configuracion = { headers: header };
      axios
        .get(`api/Ventas/VentasAnual`, configuracion)
        .then(function(response) {
          me.mesesValores = response.data;
          me.loadMasVendidos();
        })
        .catch(function(error) {
          console.log(error);
        });
    },
  },
  mounted() {
    this.getMasVendidos();
  },
};
</script>

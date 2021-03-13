<template>
  <v-layout align-start>
    <v-flex>
      <v-toolbar flat color="white">
        <v-toolbar-title>Consulta de Ventas</v-toolbar-title>
        <v-divider class="mx-2" inset vertical></v-divider>
        <v-spacer></v-spacer>
        Desde:&nbsp;
        <v-text-field
          class="text-xs-center"
          type="date"
          v-model="fechaInicio"
          v-if="!verNuevo"
        ></v-text-field>
        Hasta:&nbsp;
        <v-text-field
          class="text-xs-center"
          type="date"
          v-model="fechaFin"
          v-if="!verNuevo"
        ></v-text-field>
        <template v-if="!verNuevo"
          ><v-btn
            color="primary"
            dark
            class="mb-2"
            @click="listar"
            style="margin-left:10px"
            >Buscar</v-btn
          >
        </template>
        <v-dialog v-model="comprobanteModal" max-width="1000px">
          <v-card>
            <v-card-text>
              <v-btn @click="crearPDF" style="margin-top:20px"
                ><v-icon>print</v-icon></v-btn
              >
              <div id="factura" v-if="comprobanteModal">
                <header>
                  <div id="logo">
                    <img src="../assets/logofactura.png" id="imagen" />
                  </div>
                  <div id="datos">
                    <p id="encabezado">
                      <b>Ventas</b><br />Dirección - Estado, País<br />Telefono:(+000)00000000<br />Email:correo@servidor.com
                    </p>
                  </div>
                  <div id="fact">
                    <p>
                      {{ tipo_comprobante }}<br />
                      {{ serie_comprobante }} - {{ num_comprobante }}<br />
                      {{ fecha_hora }}
                    </p>
                  </div>
                </header>
                <br />
                <section>
                  <div>
                    <table id="facliente">
                      <tbody>
                        <tr>
                          <td id="cliente">
                            <strong>Sr(a). {{ cliente }}</strong
                            ><br />
                            <strong>Documento:</strong> {{ num_documento
                            }}<br />
                            <strong>Dirección:</strong> {{ direccion }}<br />
                            <strong>Teléfono:</strong> {{ telefono }}<br />
                            <strong>Email:</strong> {{ email }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>
                <br />
                <section>
                  <div>
                    <table id="facarticulo">
                      <thead>
                        <tr id="fa">
                          <th>CANT</th>
                          <th>DESCRIPCION</th>
                          <th>PRECIO UNIT</th>
                          <th>DESC.</th>
                          <th>PRECIO TOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="det in detalles" :key="det.iddetalle_venta">
                          <td style="text-align:center;">{{ det.cantidad }}</td>
                          <td>
                            {{ det.articulo }}
                          </td>
                          <td style="text-align:right;">
                            $ {{ det.precio.toFixed(2) }}
                          </td>
                          <td style="text-align:right;">
                            $ {{ det.descuento.toFixed(2) }}
                          </td>
                          <td style="text-align:right;">
                            $
                            {{
                              (
                                det.precio * det.cantidad -
                                det.descuento
                              ).toFixed(2)
                            }}
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <th></th>
                          <th></th>
                          <th></th>
                          <th style="text-align:right;">SUBTOTAL</th>
                          <th style="text-align:right;">
                            $
                            {{
                              (totalParcial = (total - totalImpuesto).toFixed(
                                2
                              ))
                            }}
                          </th>
                        </tr>
                        <tr>
                          <th></th>
                          <th></th>
                          <th></th>
                          <th style="text-align:right;">IVA (13%)</th>
                          <th style="text-align:right;">
                            $
                            {{
                              (totalImpuesto = (
                                (total * impuesto) /
                                (100 + impuesto)
                              ).toFixed(2))
                            }}
                          </th>
                        </tr>
                        <tr>
                          <th></th>
                          <th></th>
                          <th></th>
                          <th style="text-align:right;">TOTAL</th>
                          <th style="text-align:right;">
                            $ {{ (total = calcularTotal.toFixed(2)) }}
                          </th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </section>
                <br />
                <br />
                <footer>
                  <div id="gracias">
                    <p><b>Gracias por su compra!</b></p>
                  </div>
                </footer>
              </div>
              <v-btn @click="ocultarComprobante" color="blue darken-1" text
                >Cancelar</v-btn
              >
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="ventas"
        class="elevation-1"
        v-if="!verNuevo"
      >
        <template v-slot:[`item.estado`]="{ item }">
          <div v-if="item.estado == 'Aceptado'">
            <span class="blue--text">Aceptado</span>
          </div>
          <div v-else>
            <span class="red--text">{{ item.estado }}</span>
          </div>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-icon
            small
            class="mr-2"
            @click="verDetalles(item)"
            v-if="item.estado == 'Aceptado'"
          >
            tab
          </v-icon>
          <v-icon
            small
            class="mr-2"
            @click="mostrarComprobante(item)"
            v-if="item.estado == 'Aceptado'"
          >
            print
          </v-icon>
        </template>
        <template v-slot:no-data>
          <span>No hay datos</span>
        </template>
      </v-data-table>
      <v-container grid-list-sm class="pa-4 white" v-if="verNuevo">
        <v-layout row wrap>
          <v-flex xs12 sm4 md4 lg4 xl4>
            <v-select
              v-model="tipo_comprobante"
              :items="comprobantes"
              label="Tipo de comprobante"
              :disabled="!verDet"
            ></v-select>
          </v-flex>
          <v-flex xs12 sm4 md4 lg4 xl4>
            <v-text-field
              v-model="serie_comprobante"
              label="Serie de comprobante"
              :disabled="!verDet"
            ></v-text-field>
          </v-flex>
          <v-flex xs12 sm4 md4 lg4 xl4>
            <v-text-field
              v-model="num_comprobante"
              label="Número de comprobante"
              :disabled="!verDet"
            ></v-text-field>
          </v-flex>
          <v-flex xs12 sm8 md8 lg8 xl8>
            <v-select
              v-model="idcliente"
              :items="clientes"
              label="Cliente"
              :disabled="!verDet"
            ></v-select>
          </v-flex>
          <v-flex xs12 sm4 md4 lg4 xl4
            ><v-text-field
              type="number"
              v-model.number="impuesto"
              label="Impuesto"
              :disabled="!verDet"
            ></v-text-field
          ></v-flex>
          <v-flex xs12 sm4 md8 lg8 xl8
            ><v-text-field
              @keyup.enter="buscarCodigo"
              v-model="codigo"
              label="Código"
              v-if="verDet"
            ></v-text-field
          ></v-flex>
          <v-flex xs12 sm2 md2 lg2 xl2>
            <v-btn small fab dark color="teal" v-if="verDet">
              <v-icon @click="mostrarArticulos()" dark>list</v-icon>
            </v-btn>
          </v-flex>
          <v-flex
            xs12
            sm2
            md2
            lg2
            xl2
            v-if="errorArticulo"
            style="text-align:left;"
          >
            <div
              class="red--text"
              v-text="errorArticulo"
              style="text-align:left;margin-top:20px;"
            ></div>
          </v-flex>
          <v-flex xs12 sm12 md12 lg12 xl12>
            <v-data-table
              :headers="cabeceraDetalles"
              :items="detalles"
              hide-default-footer
              class="elevation-1"
            >
              <template v-slot:[`item.estado`]="{ item }">
                <div v-if="item.estado == 'Aceptado'">
                  <span class="blue--text">Aceptado</span>
                </div>
                <div v-else>
                  <span class="red--text">{{ props.item.estado }}</span>
                </div>
              </template>
              <template v-slot:[`item.actions`]="{ item }">
                <v-icon small class="mr-2" @click="editItem(item)">
                  edit
                </v-icon>
                <template v-if="item.estado == 'Aceptado'">
                  <v-icon small @click="activo(2, item)">
                    block
                  </v-icon>
                </template>
                <template v-else>
                  <v-icon small @click="activo(1, item)">
                    check
                  </v-icon>
                </template>
              </template>
              <template v-slot:[`item.cantidad`]="{ item }">
                <v-text-field
                  type="number"
                  v-model.number="item.cantidad"
                  :disabled="!verDet"
                ></v-text-field>
              </template>
              <template v-slot:[`item.precio`]="{ item }">
                <v-text-field
                  type="number"
                  v-model.number="item.precio"
                  disabled
                ></v-text-field>
              </template>
              <template v-slot:[`item.descuento`]="{ item }">
                <v-text-field
                  type="number"
                  v-model.number="item.descuento"
                  :disabled="!verDet"
                ></v-text-field>
              </template>
              <template v-slot:[`item.subtotal`]="{ item }">
                $
                {{ (item.cantidad * item.precio - item.descuento).toFixed(2) }}
              </template>
              <template v-slot:no-data>
                <span>No hay datos</span>
              </template>
            </v-data-table>
            <v-flex class="text-caption text-right" style="">
              <strong>Total Parcial: </strong>$
              {{ (totalParcial = (total - totalImpuesto).toFixed(2)) }}
            </v-flex>
            <v-flex class="text-caption text-right">
              <strong>Total Impuesto: </strong>$
              {{
                (totalImpuesto = (total * impuesto) / (100 + impuesto)).toFixed(
                  2
                )
              }}
            </v-flex>
            <v-flex class="text-caption text-right">
              <strong>Total Neto: </strong>$
              {{ (total = calcularTotal).toFixed(2) }}
            </v-flex>
          </v-flex>
          <v-flex xs12 sm12 md12 lg12 xl12 style="margin-top:20px"
            ><div
              class="red--text"
              v-for="v in validaMensaje"
              v-bind:key="v"
              v-text="v"
            ></div
          ></v-flex>
          <v-flex xs12 sm12 md12 lg12 xl12 style="margin-top:20px">
            <v-btn color="blue darken-1" text @click="ocultarNuevo"
              >Cancelar</v-btn
            >
            <v-btn @click="guardar" color="success" v-if="verDet"
              >Guardar</v-btn
            >
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>
  </v-layout>
</template>
<script>
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
export default {
  data() {
    return {
      ventas: [],
      dialog: false,
      headers: [
        { text: "Usuario", value: "usuario" },
        { text: "Cliente", value: "cliente" },
        { text: "Tipo de comprobante", value: "tipo_comprobante" },
        { text: "Serie de comprobante", value: "serie_comprobante" },
        {
          text: "Número de comprobante",
          value: "num_comprobante",
          sortable: false,
        },
        { text: "Fecha/Hora", value: "fecha_hora", sortable: false },
        { text: "Impuesto", value: "impuesto", sortable: false },
        { text: "Total", value: "total", sortable: false },
        { text: "Estado", value: "estado", sortable: false },
        { text: "Opciones", value: "actions", sortable: false },
      ],
      search: "",
      id: "",
      idcliente: "",
      clientes: [],
      tipo_comprobante: "",
      comprobantes: ["FACTURA", "TICKET", "BOLETA"],
      serie_comprobante: "",
      num_comprobante: "",
      impuesto: 13,
      codigo: "",
      verNuevo: false,
      errorArticulo: null,
      totalParcial: 0,
      totalImpuesto: 0,
      total: 0,
      cabeceraArticulos: [
        { text: "Articulo", value: "nombre" },
        { text: "Categoria", value: "categoria" },
        { text: "Descripcion", value: "descripcion", sortable: false },
        { text: "Stock", value: "stock" },
        { text: "Precio de venta", value: "precio_venta", sortable: false },
        { text: "Seleccionar", value: "agregarDetalle", sortable: false },
      ],
      articulos: [],
      texto: "",
      verArticulo: false,
      cabeceraDetalles: [
        { text: "Borrar", value: "borrarDetalle", sortable: false },
        { text: "Articulo", value: "articulo", sortable: false },
        { text: "Cantidad", value: "cantidad" },
        { text: "Precio ($)", value: "precio" },
        { text: "Descuento ($)", value: "descuento" },
        { text: "Subtotal ($)", value: "subtotal" },
      ],
      detalles: [],
      verDet: true,
      valida: 0,
      validaMensaje: [],
      adModal: 0,
      adAccion: 0,
      adNombre: "",
      adId: "",
      comprobanteModal: false,
      cliente: "",
      fecha_hora: "",
      num_documento: "",
      direccion: "",
      telefono: "",
      email: "",
      fechaInicio: "",
      fechaFin: "",
    };
  },
  computed: {
    calcularTotal: function() {
      var resultado = 0.0;
      for (var i = 0; i < this.detalles.length; i++) {
        resultado =
          resultado +
          this.detalles[i].precio * this.detalles[i].cantidad -
          this.detalles[i].descuento;
      }
      return resultado;
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
  },

  created() {
    this.listar();
    this.selectClientes();
  },
  methods: {
    crearPDF() {
      var quotes = document.getElementById("factura");
      html2canvas(quotes).then(function(canvas) {
        var imgData = canvas.toDataURL("image/img");
        var imgWidth = 210;
        var pageHeight = 295;
        var imgHeight = (canvas.height * imgWidth) / canvas.width;
        var heightLeft = imgHeight;
        var doc = new jsPDF("p", "mm", "a4");
        var position = 0;

        doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        doc.save("comprobanteVenta.pdf");
      });
    },
    mostrarComprobante(item) {
      this.limpiar();
      this.tipo_comprobante = item.tipo_comprobante;
      this.serie_comprobante = item.serie_comprobante;
      this.num_comprobante = item.num_comprobante;
      this.cliente = item.cliente;
      this.num_documento = item.num_documento;
      this.direccion = item.direccion;
      this.telefono = item.telefono;
      this.email = item.email;
      this.fecha_hora = item.fecha_hora;
      this.impuesto = item.impuesto;
      this.listarDetalles(item.idventa);
      this.comprobanteModal = true;
    },
    ocultarComprobante() {
      this.comprobanteModal = false;
      this.limpiar();
    },
    mostrarNuevo() {
      this.verNuevo = true;
    },
    ocultarNuevo() {
      this.verNuevo = false;
      this.limpiar();
    },
    agregarDetalle(data = []) {
      this.errorArticulo = null;
      if (this.encuentra(data["idarticulo"])) {
        this.errorArticulo = "*El artículo ya ha sido agregado";
      } else {
        this.detalles.push({
          idarticulo: data["idarticulo"],
          articulo: data["nombre"],
          cantidad: 1,
          precio: data["precio_venta"],
          descuento: 0,
        });
      }
    },

    encuentra(id) {
      var sw = 0;
      for (var i = 0; i < this.detalles.length; i++) {
        if (this.detalles[i].idarticulo == id) {
          sw = 1;
        }
      }
      return sw;
    },
    listar() {
      let me = this;
      let header = { Authorization: "Bearer " + this.$store.state.token };
      let configuracion = { headers: header };
      let url = ``;
      if (!me.fechaInicio || !me.fechaFin) {
        url = `api/Ventas/Listar`;
      } else {
        url = `api/Ventas/ConsultaFechas/${me.fechaInicio}/${me.fechaFin}`;
      }
      axios
        .get(url, configuracion)
        .then(function(response) {
          me.ventas = response.data;
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    listarDetalles(id) {
      let me = this;
      let header = { Authorization: "Bearer " + this.$store.state.token };
      let configuracion = { headers: header };
      axios
        .get(`api/Ventas/ListarDetalles/${id}`, configuracion)
        .then(function(response) {
          me.detalles = response.data;
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    verDetalles(item) {
      this.limpiar();
      this.tipo_comprobante = item.tipo_comprobante;
      this.serie_comprobante = item.serie_comprobante;
      this.num_comprobante = item.num_comprobante;
      this.idcliente = item.idcliente;
      this.impuesto = item.impuesto;
      this.listarDetalles(item.idventa);
      this.verNuevo = true;
      this.verDet = false;
    },
    selectClientes() {
      let me = this;
      let header = { Authorization: "Bearer " + this.$store.state.token };
      let configuracion = { headers: header };
      var clientesArray = [];
      axios
        .get(`api/Personas/SelectClientes`, configuracion)
        .then(function(response) {
          clientesArray = response.data;
          clientesArray.map(function(pro) {
            me.clientes.push({ text: pro.nombre, value: pro.idpersona });
          });
        })
        .catch(function(error) {
          console.log(error);
        });
    },

    cerrarModalActivo() {
      this.adModal = 0;
    },

    close() {
      this.dialog = false;
    },

    limpiar() {
      this.id = "";
      this.idcliente = "";
      this.tipo_comprobante = "";
      this.serie_comprobante = "";
      this.num_comprobante = "";
      this.impuesto = 13;
      this.codigo = "";
      this.detalles = [];
      this.total = 0;
      this.totalImpuesto = 0;
      this.totalParcial = 0;
      this.verDet = true;
    },
  },
};
</script>
<style>
.btnAgregarDetalle {
  color: #ccc;
}
.btnAgregarDetalle:hover {
  color: #0c0;
}

#factura {
  padding: 20px;
  font-family: Arial, sans-serif;
  font-size: 16px;
}

#logo {
  float: left;
  margin-left: 2%;
  margin-right: 2%;
}
#imagen {
  width: 100px;
}

#fact {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

#datos {
  float: left;
  margin-top: 0%;
  margin-left: 2%;
  margin-right: 2%;
  /*text-align: justify;*/
}

#encabezado {
  text-align: center;
  margin-left: 10px;
  margin-right: 10px;
  font-size: 16px;
}

section {
  clear: left;
}

#cliente {
  text-align: left;
}

#facliente {
  width: 40%;
  border-collapse: collapse;
  border-spacing: 0;
  margin-bottom: 15px;
}

#fa {
  color: #ffffff;
  font-size: 14px;
}

#facarticulo {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  padding: 20px;
  margin-bottom: 15px;
}

#facarticulo thead {
  padding: 20px;
  background: #2183e3;
  text-align: center;
  border-bottom: 1px solid #ffffff;
}

#gracias {
  text-align: center;
}
</style>

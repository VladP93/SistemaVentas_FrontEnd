<template>
  <v-layout align-start>
    <v-flex>
      <v-toolbar flat color="white">
        <v-btn @click="crearPDF"><v-icon>print</v-icon></v-btn>
        <v-toolbar-title>Articulos</v-toolbar-title>
        <v-divider class="mx-2" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-text-field
          class="text-xs-center"
          v-model="search"
          append-icon="search"
          label="Búsqueda"
          single-line
          hide-details
        ></v-text-field>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ on }"
            ><v-btn v-on="on" color="primary" dark class="mb-2">Nuevo</v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex xs6 sm6 md6>
                    <v-text-field
                      v-model="codigo"
                      label="Código"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs6 sm6 md6>
                    <v-select
                      v-model="idcategoria"
                      :items="categorias"
                      label="Categoría"
                    >
                    </v-select>
                  </v-flex>
                  <v-flex xs12 sm12 md12>
                    <v-text-field
                      v-model="nombre"
                      label="Nombre del artículo"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs6 sm6 md6>
                    <v-text-field
                      type="number"
                      v-model.number="stock"
                      label="Stock"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs6 sm6 md6>
                    <v-text-field
                      type="number"
                      v-model.number="precio_venta"
                      label="Precio de venta"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm12 md12>
                    <v-text-field
                      v-model="descripcion"
                      label="Descripción"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm12 md12 v-show="valida">
                    <div
                      class="red--text"
                      v-for="v in validaMensaje"
                      v-bind:key="v"
                      v-text="v"
                    ></div>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click.native="close"
                >Cancelar</v-btn
              >
              <v-btn color="blue darken-1" text @click.native="guardar"
                >Guardar</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="adModal" max-width="350px">
          <v-card>
            <v-card-title class="headline" v-if="adAccion == 1"
              >¿Activar Categoría?</v-card-title
            >
            <v-card-title class="headline" v-if="adAccion == 2"
              >¿Desactivar Categoría?</v-card-title
            >
            <v-card-text>
              Estás por
              <span class="text--green" v-if="adAccion == 1">Activar</span>
              <span class="text--red" v-if="adAccion == 2">Desactivar</span>
              el artículo {{ adNombre }}
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="red darken-1" text @click="cerrarModalActivo"
                >Cancelar</v-btn
              >
              <v-btn
                v-if="adAccion == 1"
                color="green darken-1"
                text
                @click="activar"
                >Aceptar</v-btn
              >
              <v-btn
                v-if="adAccion == 2"
                color="green darken-1"
                text
                @click="desactivar"
                >Aceptar</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="articulos"
        :search="search"
        class="elevation-1"
      >
        <template v-slot:[`item.condicion`]="{ item }">
          <div v-if="item.condicion">
            <span class="blue--text">Activo</span>
          </div>
          <div v-else>
            <span class="red--text">Desactivado</span>
          </div>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-icon small class="mr-2" @click="editItem(item)">
            edit
          </v-icon>
          <template v-if="item.condicion">
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
        <template v-slot:no-data>
          <span>No hay datos</span>
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>
<script>
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
export default {
  data() {
    return {
      articulos: [],
      dialog: false,
      headers: [
        { text: "Codigo", value: "codigo", sortable: false },
        { text: "Nombre", value: "nombre" },
        { text: "Categoria", value: "categoria" },
        { text: "Stock", value: "stock" },
        { text: "Precio de venta", value: "precio_venta" },
        { text: "Descripcion", value: "descripcion", sortable: false },
        { text: "Estado", value: "condicion", sortable: false },
        { text: "Opciones", value: "actions", sortable: false },
      ],
      search: "",
      editedIndex: -1,
      idarticulo: "",
      idcategoria: "",
      categorias: [],
      codigo: "",
      nombre: "",
      stock: 0,
      precio_venta: 0,
      descripcion: "",
      valida: 0,
      validaMensaje: [],
      adModal: 0,
      adAccion: 0,
      adNombre: "",
      adId: "",
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo articulo" : "Editando articulo";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
  },

  created() {
    this.listar();
    this.selectCategorias();
  },
  methods: {
    crearPDF() {
      var columns = [
        { title: "Nombre", dataKey: "nombre" },
        { title: "Código", dataKey: "codigo" },
        { title: "Categoría", dataKey: "categoria" },
        { title: "Stock", dataKey: "stock" },
        { title: "Precio de venta", dataKey: "precio_venta" },
      ];
      var rows = [];
      this.articulos.map(function(a) {
        rows.push({
          nombre: a.nombre,
          codigo: a.codigo,
          categoria: a.categoria,
          stock: a.stock,
          precio_venta: a.precio_venta,
        });
      });

      var doc = new jsPDF("p", "pt");
      doc.autoTable(columns, rows, {
        margin: { top: 60 },
        addPageContent: function(data) {
          doc.text("Listado de artículos", 40, 30);
        },
      });
      doc.save("Articulos_reportes.pdf");
    },
    listar() {
      let me = this;
      let header = { Authorization: "Bearer " + this.$store.state.token };
      let configuracion = { headers: header };
      axios
        .get(`api/Articulos/Listar`, configuracion)
        .then(function(response) {
          me.articulos = response.data;
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    selectCategorias() {
      let me = this;
      let header = { Authorization: "Bearer " + this.$store.state.token };
      let configuracion = { headers: header };
      var categoriasArray = [];
      axios
        .get(`api/Categorias/Select`, configuracion)
        .then(function(response) {
          categoriasArray = response.data;
          categoriasArray.map(function(cat) {
            me.categorias.push({ text: cat.nombre, value: cat.idcategoria });
          });
        })
        .catch(function(error) {
          console.log(error);
        });
    },

    editItem(item) {
      this.idarticulo = item.idarticulo;
      this.idcategoria = item.idcategoria;
      this.codigo = item.codigo;
      this.nombre = item.nombre;
      this.stock = item.stock;
      this.precio_venta = item.precio_venta;
      this.descripcion = item.descripcion;
      this.editedIndex = 1;
      this.dialog = true;
    },

    activo(accion, item) {
      this.adModal = 1;
      this.adNombre = item.nombre;
      this.adId = item.idarticulo;

      if (accion === 1) {
        this.adAccion = 1;
      } else if (accion === 2) {
        this.adAccion = 2;
      } else {
        this.adModal = 0;
      }
    },

    activar() {
      let me = this;
      let header = { Authorization: "Bearer " + this.$store.state.token };
      let configuracion = { headers: header };
      axios
        .put(`api/Articulos/Activar/${me.adId}`, {}, configuracion)
        .then(function(response) {
          me.adModal = 0;
          me.adAccion = 0;
          me.adNombre = "";
          me.adId = "";
          me.listar();
        })
        .catch(function(err) {
          console.log(err);
        });
    },
    desactivar() {
      let me = this;
      let header = { Authorization: "Bearer " + this.$store.state.token };
      let configuracion = { headers: header };
      axios
        .put(`api/Articulos/Desactivar/${me.adId}`, {}, configuracion)
        .then(function(response) {
          me.adModal = 0;
          me.adAccion = 0;
          me.adNombre = "";
          me.adId = "";
          me.listar();
        })
        .catch(function(err) {
          console.log(err);
        });
    },

    cerrarModalActivo() {
      this.adModal = 0;
    },

    close() {
      this.dialog = false;
    },

    limpiar() {
      this.idarticulo = "";
      this.idcategoria = "";
      this.codigo = "";
      this.nombre = "";
      this.stock = "";
      this.precio_venta = "";
      this.descripcion = "";
      this.editedIndex = -1;
    },

    guardar() {
      if (this.validar()) {
        return;
      }
      let header = { Authorization: "Bearer " + this.$store.state.token };
      let configuracion = { headers: header };
      if (this.editedIndex > -1) {
        //Editar
        let me = this;
        axios
          .put(
            "api/Articulos/Actualizar",
            {
              idarticulo: me.idarticulo,
              idcategoria: me.idcategoria,
              codigo: me.codigo,
              nombre: me.nombre,
              stock: me.stock,
              precio_venta: me.precio_venta,
              descripcion: me.descripcion,
            },
            configuracion
          )
          .then(function(res) {
            me.close();
            me.listar();
            me.limpiar();
          })
          .catch(function(err) {
            console.log(err);
          });
      } else {
        //Guardar
        let me = this;
        console.log("Haciendo peticion");
        axios
          .post(
            "api/Articulos/Crear",
            {
              idcategoria: me.idcategoria,
              codigo: me.codigo,
              nombre: me.nombre,
              stock: me.stock,
              precio_venta: me.precio_venta,
              descripcion: me.descripcion,
            },
            configuracion
          )
          .then(function(res) {
            console.log({
              idcategoria: me.idcategoria,
              codigo: me.codigo,
              nombre: me.nombre,
              stock: me.stock,
              precio_venta: me.precio_venta,
              descripcion: me.descripcion,
            });
            console.log("ok");
            me.close();
            me.listar();
            me.limpiar();
          })
          .catch(function(err) {
            console.log({
              idcategoria: me.idcategoria,
              codigo: me.codigo,
              nombre: me.nombre,
              stock: me.stock,
              precio_venta: me.precio_venta,
              descripcion: me.descripcion,
            });
            console.log("no ok");
            console.log(err.message);
          });
      }
      this.close();
    },

    validar() {
      this.valida = 0;
      this.validaMensaje = [];
      if (this.nombre.length < 3 || this.nombre.length > 50) {
        this.validaMensaje.push(
          "*La longitud del nombre debe de estar entre 3 a 50 caracteres."
        );
      }
      if (!this.idcategoria) {
        this.validaMensaje.push("*Seleccione una categoría.");
      }
      if (!this.stock || this.stock < 0) {
        this.validaMensaje.push("*Ingrese el stock inicial del artículo.");
      }
      if (!this.precio_venta || this.precio_venta < 0) {
        this.validaMensaje.push("*Ingrese el precio de venta del artículo.");
      }
      if (this.validaMensaje.length) {
        this.valida = 1;
      }

      return this.valida;
    },
  },
};
</script>

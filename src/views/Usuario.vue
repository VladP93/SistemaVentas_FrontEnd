<template>
  <v-layout align-start>
    <v-flex>
      <v-toolbar flat color="white">
        <v-toolbar-title>Usuarios</v-toolbar-title>
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
                  <v-flex xs12 sm6 md6>
                    <v-text-field
                      v-model="nombre"
                      label="Nombre"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 md6>
                    <v-select v-model="idrol" :items="roles" label="Rol">
                    </v-select>
                  </v-flex>
                  <v-flex xs12 sm6 md6>
                    <v-select
                      v-model="tipo_documento"
                      :items="documentos"
                      label="Tipo de documento"
                    >
                    </v-select>
                  </v-flex>
                  <v-flex xs12 sm6 md6>
                    <v-text-field
                      v-model="num_documento"
                      label="Número de documento"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 md6>
                    <v-text-field
                      v-model="direccion"
                      label="Dirección"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 md6>
                    <v-text-field
                      v-model="telefono"
                      label="Telefono"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 md6>
                    <v-text-field v-model="email" label="Email"></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm6 md6>
                    <v-text-field
                      type="password"
                      v-model="password"
                      label="Contraseña"
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
        :items="usuarios"
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
export default {
  data() {
    return {
      usuarios: [],
      dialog: false,
      headers: [
        { text: "Nombre", value: "nombre" },
        { text: "Rol", value: "rol" },
        { text: "Tipo de documento", value: "tipo_documento" },
        { text: "Número de documento", value: "num_documento" },
        { text: "Dirección", value: "direccion", sortable: false },
        { text: "Telefono", value: "telefono", sortable: false },
        { text: "Email", value: "email", sortable: false },
        { text: "Estado", value: "condicion", sortable: false },
        { text: "Opciones", value: "actions", sortable: false },
      ],
      search: "",
      editedIndex: -1,
      id: "",
      idrol: "",
      roles: [],
      tipo_documento: "",
      documentos: ["DUI", "NIT", "PASAPORTE"],
      num_documento: "",
      nombre: "",
      direccion: "",
      telefono: "",
      email: "",
      password: "",
      passwordAnt: "",
      actPassword: false,
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
      return this.editedIndex === -1 ? "Nuevo usuario" : "Editando usuario";
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
    listar() {
      let me = this;
      let header = { Authorization: "Bearer " + this.$store.state.token };
      let configuracion = { headers: header };
      axios
        .get(`api/Usuarios/Listar`, configuracion)
        .then(function(response) {
          me.usuarios = response.data;
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    selectCategorias() {
      let me = this;
      let header = { Authorization: "Bearer " + this.$store.state.token };
      let configuracion = { headers: header };
      var rolesArray = [];
      axios
        .get(`api/Roles/Select`, configuracion)
        .then(function(response) {
          rolesArray = response.data;
          rolesArray.map(function(rol) {
            me.roles.push({ text: rol.nombre, value: rol.idrol });
          });
        })
        .catch(function(error) {
          console.log(error);
        });
    },

    editItem(item) {
      this.id = item.idusuario;
      this.idrol = item.idrol;
      this.nombre = item.nombre;
      this.tipo_documento = item.tipo_documento;
      this.num_documento = item.num_documento;
      this.direccion = item.direccion;
      this.telefono = item.telefono;
      this.email = item.email;
      this.password = item.password_hash;
      this.passwordAnt = item.password_hash;
      this.editedIndex = 1;
      this.dialog = true;
    },

    activo(accion, item) {
      this.adModal = 1;
      this.adNombre = item.nombre;
      this.adId = item.idusuario;

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
        .put(`api/Usuarios/Activar/${me.adId}`, {}, configuracion)
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
        .put(`api/Usuarios/Desactivar/${me.adId}`, {}, configuracion)
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
      this.id = "";
      this.idrol = "";
      this.nombre = "";
      this.tipo_documento = "";
      this.num_documento = "";
      this.direccion = "";
      this.telefono = "";
      this.email = "";
      this.password = "";
      this.passwordAnt = "";
      this.actPassword = false;
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

        if (me.password != me.passwordAnt) {
          me.actPassword = true;
        }

        axios
          .put(
            "api/Usuarios/Actualizar",
            {
              idusuario: me.id,
              idrol: me.idrol,
              nombre: me.nombre,
              tipo_documento: me.tipo_documento,
              num_documento: me.num_documento,
              direccion: me.direccion,
              telefono: me.telefono,
              email: me.email,
              password: me.password,
              act_password: me.actPassword,
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
        axios
          .post(
            "api/Usuarios/Crear",
            {
              idrol: me.idrol,
              nombre: me.nombre,
              tipo_documento: me.tipo_documento,
              num_documento: me.num_documento,
              direccion: me.direccion,
              telefono: me.telefono,
              email: me.email,
              password: me.password,
            },
            configuracion
          )
          .then(function(res) {
            me.close();
            me.listar();
            me.limpiar();
          })
          .catch(function(err) {
            console.log({
              idrol: me.idrol,
              nombre: me.nombre,
              tipo_documento: me.tipo_documento,
              num_documento: me.num_documento,
              direccion: me.direccion,
              telefono: me.telefono,
              email: me.email,
              password: me.password,
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
      if (this.nombre.length < 3 || this.nombre.length > 100) {
        this.validaMensaje.push(
          "*La longitud del nombre debe de estar entre 3 a 100 caracteres."
        );
      }
      if (!this.idrol) {
        this.validaMensaje.push("*Seleccione un rol.");
      }
      if (!this.tipo_documento) {
        this.validaMensaje.push("*Seleccione un tipo de documento.");
      }
      if (!this.email) {
        this.validaMensaje.push("*Ingrese el email del usuario.");
      }
      if (!this.password) {
        this.validaMensaje.push("*Ingrese la contraseña.");
      }
      if (this.validaMensaje.length) {
        this.valida = 1;
      }

      return this.valida;
    },
  },
};
</script>

<template>
  <v-layout align-start>
    <v-flex>
      <v-toolbar flat color="white">
        <v-toolbar-title>Roles</v-toolbar-title>
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
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="roles"
        :search="search"
        class="elevation-1"
      >
        <template v-slot:[`item.condicion`]="{ item }">
          <div v-if="item.condicion">
            <span class="blue--text">Activo</span>
          </div>
          <div v-else>
            <span class="red--text">Inactivo</span>
          </div>
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
      roles: [],
      headers: [
        { text: "Nombre", value: "nombre" },
        { text: "Descripcion", value: "descripcion", sortable: false },
        { text: "Estado", value: "condicion", sortable: false },
      ],
      search: "",
    };
  },
  computed: {},

  watch: {},

  created() {
    this.listar();
  },
  methods: {
    listar() {
      let me = this;
      let header = { Authorization: "Bearer " + this.$store.state.token };
      let configuracion = { headers: header };
      axios
        .get(`api/roles/Listar`, configuracion)
        .then(function(response) {
          me.roles = response.data;
        })
        .catch(function(error) {
          console.log(error);
        });
    },
  },
};
</script>

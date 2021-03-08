import Vue from "vue";
import VueRouter from "vue-router";
import Login from "../views/Login.vue";
import Home from "../views/Home.vue";
import Categoria from "../views/Categoria.vue";
import Articulo from "../views/Articulo.vue";
import Rol from "../views/Rol.vue";
import Usuario from "../views/Usuario.vue";
import Cliente from "../views/Cliente.vue";
import Proveedor from "../views/Proveedor.vue";
import store from "../store/index";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
    meta: {
      administrador: true,
      bodeguero: true,
      vendedor: true,
    },
  },
  {
    path: "/categorias",
    name: "categorias",
    component: Categoria,
    meta: {
      administrador: true,
      bodeguero: true,
    },
  },
  {
    path: "/articulos",
    name: "articulos",
    component: Articulo,
    meta: {
      administrador: true,
      bodeguero: true,
    },
  },
  {
    path: "/roles",
    name: "roles",
    component: Rol,
    meta: {
      administrador: true,
    },
  },
  {
    path: "/usuarios",
    name: "usuarios",
    component: Usuario,
    meta: {
      administrador: true,
    },
  },
  {
    path: "/clientes",
    name: "clientes",
    component: Cliente,
    meta: {
      administrador: true,
      vendedor: true,
    },
  },
  {
    path: "/proveedores",
    name: "proveedores",
    component: Proveedor,
    meta: {
      administrador: true,
      bodeguero: true,
    },
  },
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: {
      libre: true,
    },
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/About.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.libre)) {
    next();
  } else if (
    store.state.usuario != null &&
    store.state.usuario.rol == "Administrador"
  ) {
    if (to.matched.some((record) => record.meta.administrador)) {
      next();
    }
  } else if (
    store.state.usuario != null &&
    store.state.usuario.rol == "Bodeguero"
  ) {
    if (to.matched.some((record) => record.meta.bodeguero)) {
      next();
    }
  } else if (
    store.state.usuario != null &&
    store.state.usuario.rol == "Vendedor"
  ) {
    if (to.matched.some((record) => record.meta.vendedor)) {
      next();
    }
  } else {
    next({
      name: "login",
    });
  }
});

export default router;

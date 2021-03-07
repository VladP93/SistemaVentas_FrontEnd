import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Categoria from "../views/Categoria.vue";
import Articulo from "../views/Articulo.vue";
import Rol from "../views/Rol.vue";
import Usuario from "../views/Usuario.vue";
import Cliente from "../views/Cliente.vue";
import Proveedor from "../views/Proveedor.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/categorias",
    name: "categorias",
    component: Categoria,
  },
  {
    path: "/articulos",
    name: "articulos",
    component: Articulo,
  },
  {
    path: "/roles",
    name: "roles",
    component: Rol,
  },
  {
    path: "/usuarios",
    name: "usuarios",
    component: Usuario,
  },
  {
    path: "/clientes",
    name: "clientes",
    component: Cliente,
  },
  {
    path: "/proveedores",
    name: "proveedores",
    component: Proveedor,
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

export default router;

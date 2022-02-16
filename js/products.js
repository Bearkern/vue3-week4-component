import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.29/vue.esm-browser.min.js';
import pagination from './component/pagination.js';
import productModalTemplate from './template/productModal.js';
import deleteProductModalTemplate from './template/deleteProductModal.js';

const site = 'https://vue3-course-api.hexschool.io/v2';
const api_path = 'clara-vue3';

let productModal = {};
let deleteProductModal = {};

const app = createApp({
  data() {
    return {
      products: [],
      detail: {
        imagesUrl: [],
      },
      newProduct: true,
      pagination: {}
    }
  },
  components: {
    pagination
  },
  methods: {
    checkLogin() {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)claraToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
      axios.defaults.headers.common['Authorization'] = token;
      const url = `${site}/api/user/check`;
      axios.post(url)
        .then(() => {
          this.getProducts();
        })
        .catch(err => {
          alert(err.data.message);
          window.location = './index.html';
        })
    },
    getProducts(page = 1) {
      const url = `${site}/api/${api_path}/admin/products?page=${page}`;
      axios.get(url)
        .then(res => {
          this.products = Object.values(res.data.products);
          this.pagination = res.data.pagination;
        })
        .catch(err => {
          alert(err.data.message);
        })
    },
    openModal(status, product) {
      if (status === 'newProduct') {
        this.detail = {
          imagesUrl: []
        };
        productModal.show();
        this.newProduct = true;
      } else if (status === 'editProduct') {
        this.detail = { ...product };
        productModal.show();
        this.newProduct = false;
      } else if (status === 'deleteProduct') {
        this.detail = { ...product };
        deleteProductModal.show();
      }
    },
  },
  mounted() {
    this.checkLogin();
    productModal = new bootstrap.Modal(document.getElementById('productModal'));
    deleteProductModal = new bootstrap.Modal(document.getElementById('deleteProductModal'));
  }
});

app.component('productModal', {
  props: ['detail', 'newProduct'],
  methods: {
    updateProduct() {
      let url = `${site}/api/${api_path}/admin/product`;
      let method = 'post';

      if (!this.newProduct) {
        url = `${site}/api/${api_path}/admin/product/${this.detail.id}`;
        method = 'put';
      }

      axios[method](url, { data: this.detail })
        .then(res => {
          alert(res.data.message);
          this.$emit('get-products');
          productModal.hide();
        })
        .catch(err => {
          alert(err.data.message);
        });
    },
    addImages() {
      this.detail.imagesUrl = [];
      this.detail.imagesUrl.push('');
    }
  },
  template: productModalTemplate
});

app.component('deleteProductModal', {
  props: ['detail'],
  methods: {
    deleteProduct() {
      const url = `${site}/api/${api_path}/admin/product/${this.detail.id}`;

      axios.delete(url)
        .then(res => {
          alert(res.data.message);
          this.$emit('get-products');
          deleteProductModal.hide();
        })
        .catch(err => {
          alert(err.data.message);
        });
    }
  },
  template: deleteProductModalTemplate
});

app.mount('#app');
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { Cart } from '../../common/Cart';
import { CartDetail } from '../../common/CartDetail';
import { Category } from '../../common/Category';
import { Favorites } from '../../common/Favorites';
import { CartService } from '../../services/cart.service';
import { CategoryService } from '../../services/category.service';
import { CustomerService } from '../../services/customer.service';
import { FavoritesService } from '../../services/favorites.service';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  isLogin: boolean = false;
  categories!: Category[];
  favorites!: Favorites[];
  cartDetails!: CartDetail[];
  cart!: Cart;

  totalFavoriteItem!: number;
  totalCartItem!: number;
  keyword: string = ' ';

  constructor(
    private categoryService: CategoryService,
    private cartService: CartService,
    private toastr: ToastrService,
    private sessionService: SessionService,
    private customerService: CustomerService,
    private router: Router,
    private favoriteService: FavoritesService) { }

  ngOnInit(): void {
    this.favoriteService.$data.subscribe(data => {
      this.totalFavoriteItem = data;
    })
    this.cartService.$data.subscribe(data => {
      this.totalCartItem = data;
    })
    this.getAllFavorites();
    this.getAllCartItem();
    this.getCategories();

    this.checkLogin();
  }

  search(event: any) {
    this.keyword = (event.target as HTMLInputElement).value;
  }

  getAllFavorites() {
    let email = this.sessionService.getUser();
    if (email == null) {
      return;
    }
    this.favoriteService.getByEmail(email).subscribe(data => {
      this.favorites = data as Favorites[];
      this.favoriteService.setLength(this.favorites.length);
    }, error => {
      this.toastr.error('Lỗi truy xuất dữ liệu!', 'Hệ thống');
    })
  }

  getAllCartItem() {
    let email = this.sessionService.getUser();
    if (email == null) {
      return;
    }
    this.cartService.getCart(email).subscribe(data => {
      this.cart = data as Cart;
      this.cartService.getAllDetail(this.cart.cartId).subscribe(data => {
        this.cartDetails = data as CartDetail[];
        this.cartService.setLength(this.cartDetails.length);
      }, error => {
        this.toastr.error('Lỗi server', 'Hệ thống');
      })
    }, error => {
      this.toastr.error('Lỗi server', 'Hệ thống');
    })
  }

  checkLogin() {
    let email = this.sessionService.getUser();
    this.customerService.getByEmail(email).subscribe(data => {
      this.isLogin = true;
    }, error => {
      this.sessionService.signOut();
      this.router.navigate(['home']);
    })
  }

  getCategories() {
    this.categoryService.getAll().subscribe(data => {
      this.categories = data as Category[];
    })
  }

  logout() {
    this.sessionService.signOut();
    window.location.href = ('/');
  }

}

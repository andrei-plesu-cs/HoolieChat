import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  //the socket used to connect to the express server
  socket

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }

  sendTheForm(form: NgForm): void {

    let temp_username = form.value.username;
    console.log(form.value.username);

    if (temp_username !== '') {
      this.router.navigate(['main-screen'], {
        queryParams: {
          username: temp_username
        }
      })
    } else {
      alert('Username has to be filled in')
    }

  }

}

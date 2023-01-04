import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { ItemService } from 'src/app/item.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css'],
  animations: [
    trigger('itemAnim', [
      transition('void => *', [
        style({
          height: 0,
          opacity: 0,
          transform: 'scale(0.85)',
          'margin-bottom': 0,
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
        }),
        animate('150ms', style({
          height: '*',
          'margin-bottom': '*',
          paddingTop: '*',
          paddingBottom: '*',
          paddingLeft: '*',
          paddingRight: '*',
        })),
        animate(68)
      ]),

      transition('* => void', [
        animate(50, style({
          transform: 'scale(1.05)'
        })),
        animate(50, style({
          transform: 'scale(1)',
          opacity: 0.75
        })),
        animate('220ms ease-out', style({
          transform: 'scale(0.68)',
          opacity: 0,
        })),
        animate('250ms ease-out', style({
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          paddingRight: 0,
          paddingLeft: 0,
          'margin-bottom': '0',
        }))
      ])
    ]),
    trigger('listAnim', [
      transition('* => *', [
        query(':enter', [
          style({
            opacity: 0,
            height: 0
          }),
          stagger(100, [
            animate('0.25s ease')
          ])
        ], {
          optional: true
        })
      ])
    ])
  ]
})

export class PostComponent implements OnInit {

  post$: Observable<any>;
  isDisplayed: boolean = false;
  activeUser: any;

  constructor(
    private activatedRoute: ActivatedRoute,
    private itemService: ItemService,
    private afs: AngularFirestore
  ) { }

  ngOnInit(): void {
    this.post$ = this.activatedRoute.paramMap.pipe(
      switchMap(params => {
        let id: string = params.get('id');
        return this.itemService.getPostById(id);
      })
    )

    this.afs.collection('users')
    .doc(localStorage.getItem('id')!)
    .valueChanges()
    .subscribe(res => { this.activeUser = res })
  }

}
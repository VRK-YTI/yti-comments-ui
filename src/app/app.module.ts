import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FrontpageComponent } from './frontpage/frontpage.component';
import { Router, RouterModule, Routes } from '@angular/router';
// import { TranslateLoader, TranslateModule } from 'ng2-translate';
import { of } from 'rxjs';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommentsComponent } from './comments/comments.component';
import { CommentRoundsComponent } from './commentrounds/commentrounds.component';
import { GlobalCommentsComponent } from './globalcomments/globalcomments.component';
import { CommentComponent } from './comment/comment.component';
import { CommentRoundComponent } from './commentround/commentround.component';

declare var require: any;

export function createTranslateLoader(): TranslateLoader {
  return { getTranslation: (lang: string) => of(localizations[lang]) };
}

const localizations: { [lang: string]: string } = {
  fi: Object.assign({},
    require('json-loader!po-loader?format=mf!../../po/fi.po')
  )
  ,
  en: Object.assign({},
    require('json-loader!po-loader?format=mf!../../po/en.po')
  )
};

const appRoutes: Routes = [
  { path: '', component: CommentRoundsComponent },
  { path: 'frontpage', redirectTo: '/', pathMatch: 'full' },
  { path: 'commentrounds', component: CommentRoundsComponent, pathMatch: 'full' },
  { path: 'commentround', component: CommentRoundComponent, pathMatch: 'full' },
  { path: 'globalcomments', component: GlobalCommentsComponent, pathMatch: 'full' },
  { path: 'comments', component: CommentsComponent, pathMatch: 'full' },
  { path: 'comment', component: CommentComponent, pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    FrontpageComponent,
    CommentsComponent,
    CommentRoundsComponent,
    GlobalCommentsComponent,
    CommentComponent,
    CommentRoundComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes, { enableTracing: false }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader
      }
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}

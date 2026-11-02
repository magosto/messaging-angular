import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { MessageService } from '../../services/message.service';

interface ResponseLine {
  text: string;
  isError: boolean;
}

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-message-page',
  styleUrl: './message-page.scss',
  templateUrl: './message-page.html',
})
export class MessagePage {
  private readonly messageService = inject(MessageService);

  protected readonly form = new FormGroup({
    message: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  protected readonly responses = signal<ResponseLine[]>([]);
  protected readonly sending = signal(false);

  protected submit(): void {
    const body = this.form.controls.message.value.trim();
    if (!body || this.sending()) {
      return;
    }

    this.sending.set(true);
    this.messageService
      .sendMessage(body)
      .pipe(finalize(() => this.sending.set(false)))
      .subscribe({
        next: (response) => {
          this.addResponse(`${response.status} (${response.messageId})`, false);
          this.form.reset();
        },
        error: (error: HttpErrorResponse) => {
          // Keeps the typed message in the input so that it can be resent.
          this.addResponse(error.error?.detail ?? error.error?.title ?? error.message, true);
        },
      });
  }

  private addResponse(text: string, isError: boolean): void {
    this.responses.update((responses) => [...responses, { text, isError }]);
  }
}

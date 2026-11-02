import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Values match the API's MessageProvider enum, which is serialized as a number.
export enum MessageProvider {
  SMS = 0,
  WhatsApp = 1,
  Email = 2,
}

export interface SendMessageRequest {
  recipient: string;
  body: string;
  provider: MessageProvider;
}

export interface SendMessageResponse {
  messageId: string;
  status: string;
}

// The page only collects the message body, but the API requires these as well.
const DEFAULT_RECIPIENT = '+15555550100';
const DEFAULT_PROVIDER = MessageProvider.SMS;

@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = '/api/Message';

  sendMessage(body: string): Observable<SendMessageResponse> {
    const request: SendMessageRequest = {
      recipient: DEFAULT_RECIPIENT,
      body,
      provider: DEFAULT_PROVIDER,
    };

    return this.http.post<SendMessageResponse>(this.apiUrl, request);
  }
}

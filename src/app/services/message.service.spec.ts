import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MessageProvider, MessageService } from './message.service';

describe('MessageService', () => {
  let service: MessageService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MessageService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should post the message in the format the API expects', () => {
    service.sendMessage('Hello').subscribe();

    const request = http.expectOne('/api/Message');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      recipient: expect.any(String),
      body: 'Hello',
      provider: MessageProvider.SMS,
    });
    request.flush({ messageId: '1', status: 'Message Sent Successfully' });
  });
});

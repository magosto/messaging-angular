import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { MessageService, SendMessageResponse } from '../../services/message.service';
import { MessagePage } from './message-page';

describe('MessagePage', () => {
  const sendMessage = vi.fn();

  const setup = async () => {
    const fixture = TestBed.createComponent(MessagePage);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    const submit = async (value: string) => {
      const input = element.querySelector('input')!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
      element.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
    };
    const lines = () =>
      Array.from(element.querySelectorAll('.response')).map((line) => line.textContent);

    return { fixture, element, submit, lines };
  };

  beforeEach(() => {
    sendMessage.mockReset();
    TestBed.configureTestingModule({
      imports: [MessagePage],
      providers: [{ provide: MessageService, useValue: { sendMessage } }],
    });
  });

  it('should show each response on a new line and clear the input', async () => {
    sendMessage
      .mockReturnValueOnce(of({ messageId: '1', status: 'Sent' }))
      .mockReturnValueOnce(of({ messageId: '2', status: 'Sent' }));
    const { element, submit, lines } = await setup();

    await submit('First');
    await submit('Second');

    expect(sendMessage).toHaveBeenCalledWith('First');
    expect(lines()).toEqual(['Sent (1)', 'Sent (2)']);
    expect(element.querySelector('input')!.value).toBe('');
  });

  it('should show the API error and keep the typed message', async () => {
    sendMessage.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { title: 'Invalid Argument', detail: 'Body cannot be null or empty' },
          }),
      ),
    );
    const { element, submit, lines } = await setup();

    await submit('Hello');

    expect(lines()).toEqual(['Body cannot be null or empty']);
    expect(element.querySelector('.response')!.classList).toContain('error');
    expect(element.querySelector('input')!.value).toBe('Hello');
  });

  it('should not send a blank message', async () => {
    const { submit } = await setup();

    await submit('   ');

    expect(sendMessage).not.toHaveBeenCalled();
  });

  it('should disable the button while sending', async () => {
    const response = new Subject<SendMessageResponse>();
    sendMessage.mockReturnValue(response);
    const { fixture, element, submit } = await setup();

    await submit('Hello');
    expect(element.querySelector('button')!.disabled).toBe(true);

    response.next({ messageId: '1', status: 'Sent' });
    response.complete();
    await fixture.whenStable();
    expect(element.querySelector('button')!.disabled).toBe(false);
  });
});

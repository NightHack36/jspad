import { useState } from 'react';
import './style.css';
import copy from 'copy-to-clipboard';
import { useToasts } from 'react-toast-notifications';
import { PUBLIC_URL } from '../../utils/config';

const Component = (props) => {
  const { script = '', language = 'nodejs' } = props;
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToasts();

  const callCallbak = (res) => {
    props.onOutput && props.onOutput(res);
    setIsLoading(false);
  };

  const executeCode = async ({ script, language }) => {
    setIsLoading(true);
    props.onOutput && props.onOutput(null);

    const worker = new Worker(PUBLIC_URL + '/worker.js');

    setTimeout(() => {
      let res = null;
      worker.postMessage(script);

      // handle output
      worker.addEventListener('message', function (e) {
        console.log('Message from Worker: ', e.data);
        res = e.data;
        callCallbak(res);
      });

      // handle timeouts
      setTimeout(() => {
        worker.terminate();
        if (!res) {
          const timeoutMsg = 'Timeout reached before any output';
          res = {
            date: new Date().toString(),
            hasError: true,
            stdout: [timeoutMsg],
          };

          addToast(timeoutMsg, {
            appearance: 'error',
          });
          callCallbak(res);
        }
      }, 5 * 1000);
    }, 500);
  };
  return (
    <div className='row runner'>
      <div className='col'>
        <button
          type='button'
          disabled={isLoading}
          onClick={() => executeCode({ script, language })}
          className='btn btn-success btn-sm'
        >
          {!isLoading ? (
            <>
              <i className='fa fa-play '></i> Run
            </>
          ) : (
            <>
              <i className='fa fa-cog fa-spin'></i> Running...
            </>
          )}
        </button>
        <a
          className='btn btn-primary text-white ml-2 btn-sm'
          href='/'
          target='_blank'
        >
          <i className='fa fa-plus-circle'></i>
        </a>
        <button
          className='btn btn-secondary ml-2 btn-sm'
          onClick={() => {
            copy(window.location.href);
          }}
        >
          <i className='fa fa-share'></i>
        </button>
      </div>

      <div className='col-auto'>
        <tt className='text-light'>
          <a
            className='github-button'
            href='https://github.com/mkhizeryounas/jspad'
            data-icon='octicon-star'
            data-show-count='true'
            aria-label='Star mkhizeryounas/jspad on GitHub'
          >
            Star
          </a>
        </tt>
      </div>
    </div>
  );
};

export default Component;

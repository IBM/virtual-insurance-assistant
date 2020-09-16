from python:latest
RUN useradd -ms /bin/bash jupyter
USER jupyter
RUN pip install jupyterlab --user jupyter
RUN echo 'export PATH="$HOME/.local/bin:$PATH"' >> /home/jupyter/.profile
RUN echo 'export PATH="$HOME/.local/bin:$PATH"' >> /home/jupyter/.bashrc
EXPOSE 8888
#CMD jupyter-notebook
CMD /home/jupyter/.local/bin/jupyter-notebook --ip=0.0.0.0 --port=8888

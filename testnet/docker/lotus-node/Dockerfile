FROM golang

RUN apt-get update  # && apt-get install -y git make
RUN apt-get install -y jq mesa-opencl-icd ocl-icd-opencl-dev

WORKDIR /src

RUN git clone https://github.com/filecoin-project/lotus .

RUN git branch testnet/3

RUN git checkout 70e690da

RUN make deps
RUN make debug

# RUN rm -rf ~/.lotus ~/.lotusstorage ~/.genesis-sectors

RUN ./lotus-seed pre-seal --sector-size 2048 --num-sectors 10
RUN ./lotus-seed genesis new lotusgen.json
RUN ./lotus-seed genesis add-miner lotusgen.json ~/.genesis-sectors/pre-seal-t01000.json

ENTRYPOINT ["./lotus", "daemon","--lotus-make-genesis=dev.gen","--genesis-template=lotusgen.json","--bootstrap=false"]
#./lotus daemon --lotus-make-genesis=dev.gen  --bootstrap=false

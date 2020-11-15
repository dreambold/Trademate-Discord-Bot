.PHONY: clean backend frontend deps

all: deps backend frontend

clean:
	rm -rf tm-backend/dist tm-frontend/dist tm-backend/node_modules tm-frontend/node_modules

deps:
	cd tm-backend; npm install
	cd tm-frontend; npm install

backend:
	cd tm-backend; npm run build

frontend:
	cd tm-frontend; npm run build

lint:
	cd tm-backend; npm run lint --silent

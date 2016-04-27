// WARNING: this file is generated, DO NOT EDIT

// WARNING: if you haven't read the first line yet, please do so
#include "aubiowraphell.h"

typedef struct
{
  PyObject_HEAD
  aubio_specdesc_t * o;
  char_t* method;
  uint_t buf_size;
} Py_specdesc;

static char Py_specdesc_doc[] = "specdesc object";

static PyObject *
Py_specdesc_new (PyTypeObject * pytype, PyObject * args, PyObject * kwds)
{
  Py_specdesc *self;
  char_t* method = NULL;
  uint_t buf_size = 0;
  static char *kwlist[] = { "method", "buf_size", NULL };

  if (!PyArg_ParseTupleAndKeywords (args, kwds, "|sI", kwlist,
          &method, &buf_size)) {
    return NULL;
  }

  self = (Py_specdesc *) pytype->tp_alloc (pytype, 0);

  if (self == NULL) {
    return NULL;
  }

  self->method = "default";
  if (method != NULL) {
    self->method = method;
  }

  self->buf_size = Py_default_vector_length;
  if ((sint_t)buf_size > 0) {
    self->buf_size = buf_size;
  } else if ((sint_t)buf_size < 0) {
    PyErr_SetString (PyExc_ValueError,
        "can not use negative value for buf_size");
    return NULL;
  }

  return (PyObject *) self;
}

AUBIO_INIT(specdesc , self->method, self->buf_size)

AUBIO_DEL(specdesc)

/* function Py_specdesc_do */
static PyObject * 
Py_specdesc_do(Py_specdesc * self, PyObject * args)
{
  /* input vectors python prototypes */
  PyObject * fftgrain_obj;

  /* input vectors prototypes */
  cvec_t* fftgrain;
  /* output vectors prototypes */
  fvec_t* desc;


  if (!PyArg_ParseTuple (args, "O", &fftgrain_obj)) {
    return NULL;
  }


  /* input vectors parsing */
  fftgrain = PyAubio_ArrayToCCvec (fftgrain_obj);

  if (fftgrain == NULL) {
    return NULL;
  }

  
  
  /* creating output desc as a new_fvec of length 1 */
  desc = new_fvec (1);


  /* compute _do function */
  aubio_specdesc_do (self->o, fftgrain, desc);

  return (PyObject *)PyAubio_CFvecToArray (desc);
}

AUBIO_MEMBERS_START(specdesc)
  {"method", T_STRING, offsetof (Py_specdesc, method), READONLY, ""},
  {"buf_size", T_INT, offsetof (Py_specdesc, buf_size), READONLY, ""},
AUBIO_MEMBERS_STOP(specdesc)


static PyMethodDef Py_specdesc_methods[] = {
  {NULL} /* sentinel */
};

AUBIO_TYPEOBJECT(specdesc, "aubio.specdesc")

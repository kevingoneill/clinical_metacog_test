library(readr)
library(dplyr)
library(tidyr)
library(tibble)
#library(rstan)   # commented out because rstan is not actually available for webR

FILENAME <- '../data/pilot/experiment_data.csv'

#' standata(file, K):
#'   preprocess the data, focusing on main_task trials
#'   and binning the trials by [response, accuracy, confidence]
#'
#'   file: the filename or literal string containing the data
#'   K: the number of confidence levels
#' 
standata <- function(file, K=5) {
    d <- read_csv(file, col_select=c(phase, task, response, correct),
                  progress=FALSE, show_col_types=FALSE) %>%
        filter(phase == 'main_task',
               task %in% c('rdm_decision', 'local_confidence')) %>%
        mutate(trial=rep(seq_len(n()/2), each=2)) %>%
        select(trial, task, response, correct) %>%
        pivot_wider(names_from=task, values_from=response:correct) %>%
        select(-correct_local_confidence) %>%
        mutate_all(as.integer) %>%
        rename(response=response_rdm_decision,
               confidence=response_local_confidence,
               correct=correct_rdm_decision) %>%
        group_by(response, correct, confidence, .drop=FALSE) %>%
        count() %>%
        ungroup %>%
        complete(response=0:1, correct=0:1, confidence=1:K, fill=list(n=0))

    list(N=nrow(d),
         K=5,
         C=d %>%
             arrange(confidence, correct, response) %>%
             pull(n) %>%
             array(dim=c(2, 2, K)),
         prior_sd_d_prime=.5,
         prior_sd_c=.5,
         prior_sd_log_M=.25,
         prior_mean_meta_c2=-1,
         prior_sd_meta_c2=1,
         prior_only=FALSE)
}

#m_ratio_cmdstanr <- function(file, K=5,
#                             parameters=c('d_prime', 'c', 'log_M',
#                                          'meta_d_prime', 'meta_c',
#                                          'meta_c2_0', 'meta_c2_1'),
#                             ...) {
#    m <- cmdstan_model('metad_summary.stan')
#    fit <- m$sample(data=standata(file, K), show_messages=FALSE, show_exceptions=FALSE, ...)
#    
#    fit$summary(c('d_prime', 'c', 'log_M', 'meta_d_prime', 'meta_c', 'meta_c2_0', 'meta_c2_1'),
#                mean, .lower=~first(quantile(., probs=.025)),
#                .upper=~first(quantile(., probs=.975)))
#}


#' m_ratio(...):
#'   fit the meta-d' model to the data and return a summary
#'
#'   parameters: the names of the parameters to output
#'   ...: passed to `standata`
#' 
m_ratio <- function(file, K=5,
                    parameters=c('d_prime', 'c', 'log_M',
                                 'meta_d_prime', 'meta_c',
                                 'meta_c2_0', 'meta_c2_1'),
                    ...) {
    sm <- stan_model('metad_summary.stan', save_dso=FALSE)
    fit <- sampling(sm, data=standata(file, K), refresh=0, ...)
    
    (summary(fit, pars=parameters,
             probs=c(.025, .5, .975))$summary) %>%
        as_tibble(rownames='.variable') %>%
        rename(.variable=, median=`50%`, .lower=`2.5%`, .upper=`97.5%`) %>%
        select(.variable, median, .lower, .upper)   
}

#m_ratio(FILENAME, iter=2250, warmup=250)
#m_ratio_cmdstanr(FILENAME)





